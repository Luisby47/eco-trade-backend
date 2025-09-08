import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';

/**
 * Purchases service for managing purchase operations
 */
@Injectable()
export class PurchasesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new purchase
   */
  async create(createPurchaseDto: CreatePurchaseDto, buyerId: string) {
    // Check if product exists and is available
    const product = await this.prisma.product.findUnique({
      where: { id: createPurchaseDto.product_id },
      select: { status: true, seller_id: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.status !== 'available') {
      throw new Error('El producto no está disponible para compra');
    }

    if (product.seller_id === buyerId) {
      throw new Error('No puedes comprar tu propio producto');
    }

    // Create purchase and update product status
    const [purchase] = await this.prisma.$transaction([
      this.prisma.purchase.create({
        data: {
          ...createPurchaseDto,
          buyer_id: buyerId,
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
            },
          },
          buyer: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
      this.prisma.product.update({
        where: { id: createPurchaseDto.product_id },
        data: { status: 'reserved' },
      }),
    ]);

    return {
      ...purchase,
      product: {
        ...purchase.product,
        images: JSON.parse(purchase.product.images),
      },
    };
  }

  /**
   * Find all purchases with filters
   */
  async findAll(
    userId: string,
    filters: {
      status?: string;
      role?: 'buyer' | 'seller' | 'all';
      page?: number;
      limit?: number;
    } = {},
  ) {
    const { status, role = 'all', page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    let where: any = {};

    if (role === 'buyer') {
      where.buyer_id = userId;
    } else if (role === 'seller') {
      where.seller_id = userId;
    } else {
      where.OR = [{ buyer_id: userId }, { seller_id: userId }];
    }

    if (status) {
      where.status = status;
    }

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
            },
          },
          buyer: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.purchase.count({ where }),
    ]);

    const purchasesWithParsedImages = purchases.map((purchase) => ({
      ...purchase,
      product: {
        ...purchase.product,
        images: JSON.parse(purchase.product.images),
      },
    }));

    return {
      purchases: purchasesWithParsedImages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  /**
   * Find purchase by ID
   */
  async findOne(id: string, userId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
          },
        },
        buyer: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        seller: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
        chat_messages: {
          orderBy: { created_at: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                full_name: true,
                profile_picture: true,
              },
            },
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }

    // Check if user is involved in this purchase
    if (purchase.buyer_id !== userId && purchase.seller_id !== userId) {
      throw new ForbiddenException('No tienes permisos para ver esta compra');
    }

    return {
      ...purchase,
      product: {
        ...purchase.product,
        images: JSON.parse(purchase.product.images),
      },
    };
  }

  /**
   * Update purchase status
   */
  async update(
    id: string,
    updatePurchaseDto: UpdatePurchaseDto,
    userId: string,
  ) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      select: { buyer_id: true, seller_id: true, product_id: true },
    });

    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }

    // Check if user is involved in this purchase
    if (purchase.buyer_id !== userId && purchase.seller_id !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar esta compra',
      );
    }

    // If purchase is being completed, update product status to sold
    const updateData: any = { ...updatePurchaseDto };
    let productUpdate: any = null;

    if (updatePurchaseDto.status === 'completed') {
      productUpdate = this.prisma.product.update({
        where: { id: purchase.product_id },
        data: { status: 'sold' },
      });
    } else if (updatePurchaseDto.status === 'cancelled') {
      productUpdate = this.prisma.product.update({
        where: { id: purchase.product_id },
        data: { status: 'available' },
      });
    }

    const operations = [
      this.prisma.purchase.update({
        where: { id },
        data: updateData,
        include: {
          product: {
            select: {
              id: true,
              title: true,
              price: true,
              images: true,
            },
          },
          buyer: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
          seller: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
            },
          },
        },
      }),
    ];

    if (productUpdate) {
      operations.push(productUpdate);
    }

    const [updatedPurchase] = await this.prisma.$transaction(operations);

    return {
      ...updatedPurchase,
      product: {
        ...updatedPurchase.product,
        images: JSON.parse(updatedPurchase.product.images),
      },
    };
  }

  /**
   * Delete purchase (cancel it)
   */
  async remove(id: string, userId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      select: { buyer_id: true, seller_id: true, product_id: true },
    });

    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }

    if (purchase.buyer_id !== userId && purchase.seller_id !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para cancelar esta compra',
      );
    }

    // Cancel purchase and make product available again
    await this.prisma.$transaction([
      this.prisma.purchase.update({
        where: { id },
        data: { status: 'cancelled' },
      }),
      this.prisma.product.update({
        where: { id: purchase.product_id },
        data: { status: 'available' },
      }),
    ]);

    return { message: 'Compra cancelada exitosamente' };
  }
}
