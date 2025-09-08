import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

/**
 * Products service for managing product data operations
 */
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new product
   */
  async create(createProductDto: CreateProductDto, sellerId: string) {
    const productData = {
      ...createProductDto,
      images: JSON.stringify(createProductDto.images),
      seller_id: sellerId,
    };

    return this.prisma.product.create({
      data: productData,
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            location: true,
            profile_picture: true,
            rating: true,
            total_reviews: true,
          },
        },
      },
    });
  }

  /**
   * Find all products with filters and pagination
   */
  async findAll(
    filters: {
      category?: string;
      condition?: string;
      gender?: string;
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      featured?: boolean;
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const {
      category,
      condition,
      gender,
      location,
      minPrice,
      maxPrice,
      search,
      featured,
      status = 'available',
      page = 1,
      limit = 12,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;

    // Build price filter safely to avoid referencing an uninitialized variable
    const priceFilter: Prisma.IntFilter = {};
    if (minPrice !== undefined) {
      priceFilter.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      priceFilter.lte = maxPrice;
    }

    const where: Prisma.ProductWhereInput = {
      status,
      ...(category && { category }),
      ...(condition && { condition }),
      ...(gender && { gender }),
      ...(location && { location }),
      ...(featured !== undefined && { featured }),
      ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else {
      orderBy[sortBy as keyof Prisma.ProductOrderByWithRelationInput] =
        sortOrder;
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              full_name: true,
              location: true,
              profile_picture: true,
              rating: true,
              total_reviews: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    // Parse images JSON for each product
    const productsWithParsedImages = products.map((product) => ({
      ...product,
      images: JSON.parse(product.images),
    }));

    return {
      products: productsWithParsedImages,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  /**
   * Find featured products for homepage
   */
  async findFeatured(limit = 6) {
    const products = await this.prisma.product.findMany({
      where: {
        featured: true,
        status: 'available',
      },
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            location: true,
            profile_picture: true,
            rating: true,
            total_reviews: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      images: JSON.parse(product.images),
    }));
  }

  /**
   * Find product by ID
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            location: true,
            profile_picture: true,
            rating: true,
            total_reviews: true,
          },
        },
        questions: {
          include: {
            answers: {
              orderBy: { created_date: 'asc' },
            },
          },
          orderBy: { created_date: 'desc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return {
      ...product,
      images: JSON.parse(product.images),
    };
  }

  /**
   * Find products by seller
   */
  async findBySeller(sellerId: string) {
    const products = await this.prisma.product.findMany({
      where: { seller_id: sellerId },
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            location: true,
            profile_picture: true,
            rating: true,
            total_reviews: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return products.map((product) => ({
      ...product,
      images: JSON.parse(product.images),
    }));
  }

  /**
   * Update product
   */
  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { seller_id: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.seller_id !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar este producto',
      );
    }

    // Build update data explicitly to satisfy Prisma types
    const updateData: Prisma.ProductUpdateInput = {};
    if (updateProductDto.title !== undefined)
      updateData.title = updateProductDto.title;
    if (updateProductDto.category !== undefined)
      updateData.category = updateProductDto.category;
    if (updateProductDto.description !== undefined)
      updateData.description = updateProductDto.description;
    if (updateProductDto.price !== undefined)
      updateData.price = updateProductDto.price;
    if (updateProductDto.size !== undefined)
      updateData.size = updateProductDto.size;
    if (updateProductDto.condition !== undefined)
      updateData.condition = updateProductDto.condition;
    if (updateProductDto.location !== undefined)
      updateData.location = updateProductDto.location;
    if (updateProductDto.gender !== undefined)
      updateData.gender = updateProductDto.gender;
    if (updateProductDto.status !== undefined)
      updateData.status = updateProductDto.status;
    if (updateProductDto.featured !== undefined)
      updateData.featured = updateProductDto.featured;
    if (updateProductDto.images !== undefined) {
      updateData.images = JSON.stringify(updateProductDto.images);
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            full_name: true,
            location: true,
            profile_picture: true,
            rating: true,
            total_reviews: true,
          },
        },
      },
    });

    return {
      ...updatedProduct,
      images: JSON.parse(updatedProduct.images),
    };
  }

  /**
   * Delete product
   */
  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: { seller_id: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.seller_id !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este producto',
      );
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  /**
   * Get product categories
   */
  getCategories() {
    return [
      { value: 'camisas', label: 'Camisas' },
      { value: 'pantalones', label: 'Pantalones' },
      { value: 'vestidos', label: 'Vestidos' },
      { value: 'zapatos', label: 'Zapatos' },
      { value: 'chaquetas', label: 'Chaquetas' },
      { value: 'accesorios', label: 'Accesorios' },
      { value: 'deportiva', label: 'Deportiva' },
      { value: 'otro', label: 'Otro' },
    ];
  }
}
