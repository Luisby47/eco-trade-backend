import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * Users service for managing user data operations
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new user
   */
  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        products: true,
        reviews_received: {
          include: {
            reviewer: {
              select: { full_name: true, profile_picture: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Get all users (admin only)
   */
  async findAll(skip?: number, take?: number) {
    return this.prisma.user.findMany({
      skip,
      take,
      select: {
        id: true,
        email: true,
        full_name: true,
        location: true,
        gender: true,
        profile_picture: true,
        rating: true,
        total_reviews: true,
        created_at: true,
      },
    });
  }

  /**
   * Update user profile
   */
  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          full_name: true,
          location: true,
          gender: true,
          phone: true,
          profile_picture: true,
          rating: true,
          total_reviews: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }

  /**
   * Update user rating after a new review
   */
  async updateRating(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { reviewed_user_id: userId },
    });

    if (reviews.length === 0) {
      return this.prisma.user.update({
        where: { id: userId },
        data: { rating: 0, total_reviews: 0 },
      });
    }

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        total_reviews: reviews.length,
      },
    });
  }

  /**
   * Delete user (admin only)
   */
  async delete(id: string) {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Usuario no encontrado');
      }
      throw error;
    }
  }
}
