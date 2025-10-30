import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';

/**
 * Chat service for managing chat message operations
 */
@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new chat message
   */
  async create(
    createChatMessageDto: CreateChatMessageDto,
    userId: string,
    userName: string,
  ) {
    // Verify that the user is part of the purchase (buyer or seller)
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: createChatMessageDto.purchase_id },
      select: { buyer_id: true, seller_id: true },
    });

    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }

    if (purchase.buyer_id !== userId && purchase.seller_id !== userId) {
      throw new ForbiddenException('No tienes acceso a este chat');
    }

    return this.prisma.chatMessage.create({
      data: {
        ...createChatMessageDto,
        sender_id: userId,
        sender_name: userName,
      },
      include: {
        sender: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
      },
    });
  }

  /**
   * Get all messages for a purchase
   */
  async findByPurchase(purchaseId: string, userId: string) {
    // Verify that the user is part of the purchase
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: { buyer_id: true, seller_id: true },
    });

    if (!purchase) {
      throw new NotFoundException('Compra no encontrada');
    }

    if (purchase.buyer_id !== userId && purchase.seller_id !== userId) {
      throw new ForbiddenException('No tienes acceso a este chat');
    }

    return this.prisma.chatMessage.findMany({
      where: { purchase_id: purchaseId },
      include: {
        sender: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  /**
   * Get all chats for a user (grouped by purchase)
   */
  async findAllChats(userId: string) {
    // Get all purchases where user is buyer or seller
    const purchases = await this.prisma.purchase.findMany({
      where: {
        OR: [
          { buyer_id: userId },
          { seller_id: userId },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            price: true,
          },
        },
        buyer: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
        seller: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
        chat_messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: { updated_at: 'desc' },
    });

    // Format the response to include last message and unread count
    return purchases.map((purchase) => {
      const lastMessage = purchase.chat_messages[0] || null;
      const otherUser = purchase.buyer_id === userId ? purchase.seller : purchase.buyer;

      return {
        purchase_id: purchase.id,
        purchase: {
          id: purchase.id,
          buyer_id: purchase.buyer_id,
          seller_id: purchase.seller_id,
          status: purchase.status,
        },
        product: {
          ...purchase.product,
          images: JSON.parse(purchase.product.images),
        },
        other_user: otherUser,
        last_message: lastMessage,
        status: purchase.status,
        updated_at: purchase.updated_at,
      };
    });
  }

  /**
   * Delete a message (only by sender)
   */
  async remove(id: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id },
      select: { sender_id: true },
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    if (message.sender_id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este mensaje');
    }

    return this.prisma.chatMessage.delete({
      where: { id },
    });
  }
}
