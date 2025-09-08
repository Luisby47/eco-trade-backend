import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UsersService } from '../users/users.service';

/**
 * Reviews service for managing review operations
 */
@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  /**
   * Create a new review
   */
  async create(
    createReviewDto: CreateReviewDto,
    reviewerId: string,
    reviewerName: string,
  ) {
    // Check if reviewer is trying to review themselves
    if (createReviewDto.reviewed_user_id === reviewerId) {
      throw new ForbiddenException('No puedes evaluarte a ti mismo');
    }

    // Check if purchase exists and reviewer is involved
    if (createReviewDto.purchase_id) {
      const purchase = await this.prisma.purchase.findUnique({
        where: { id: createReviewDto.purchase_id },
        select: { buyer_id: true, seller_id: true },
      });

      if (!purchase) {
        throw new NotFoundException('Compra no encontrada');
      }

      if (
        purchase.buyer_id !== reviewerId &&
        purchase.seller_id !== reviewerId
      ) {
        throw new ForbiddenException('No puedes evaluar esta transacción');
      }
    }

    const review = await this.prisma.review.create({
      data: {
        ...createReviewDto,
        reviewer_id: reviewerId,
        reviewer_name: reviewerName,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
        reviewed_user: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    // Update user rating
    await this.usersService.updateRating(createReviewDto.reviewed_user_id);

    return review;
  }

  /**
   * Get reviews for a user
   */
  async findByUser(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { reviewed_user_id: userId },
        include: {
          reviewer: {
            select: {
              id: true,
              full_name: true,
              profile_picture: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { reviewed_user_id: userId },
      }),
    ]);

    return {
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  /**
   * Get review by ID
   */
  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
        reviewed_user: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    return review;
  }

  /**
   * Delete review (only by reviewer)
   */
  async remove(id: string, userId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { reviewer_id: true, reviewed_user_id: true },
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    if (review.reviewer_id !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta reseña',
      );
    }

    await this.prisma.review.delete({
      where: { id },
    });

    // Update user rating after deletion
    await this.usersService.updateRating(review.reviewed_user_id);

    return { message: 'Reseña eliminada exitosamente' };
  }
}
