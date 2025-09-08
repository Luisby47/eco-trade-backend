import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';

/**
 * Questions service for managing Q&A operations
 */
@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new question
   */
  async create(
    createQuestionDto: CreateQuestionDto,
    userId: string,
    userName: string,
  ) {
    return this.prisma.question.create({
      data: {
        ...createQuestionDto,
        user_id: userId,
        user_name: userName,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                profile_picture: true,
              },
            },
          },
          orderBy: { created_date: 'asc' },
        },
      },
    });
  }

  /**
   * Get all questions for a product
   */
  async findByProduct(productId: string) {
    return this.prisma.question.findMany({
      where: { product_id: productId },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                profile_picture: true,
              },
            },
          },
          orderBy: { created_date: 'asc' },
        },
      },
      orderBy: { created_date: 'desc' },
    });
  }

  /**
   * Get question by ID
   */
  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                profile_picture: true,
              },
            },
          },
          orderBy: { created_date: 'asc' },
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    return question;
  }

  /**
   * Delete question (only by the author)
   */
  async remove(id: string, userId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!question) {
      throw new NotFoundException('Pregunta no encontrada');
    }

    if (question.user_id !== userId) {
      throw new Error('No tienes permisos para eliminar esta pregunta');
    }

    return this.prisma.question.delete({
      where: { id },
    });
  }
}
