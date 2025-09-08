import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAnswerDto } from './dto/create-answer.dto';

/**
 * Answers service for managing answer operations
 */
@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new answer
   */
  async create(
    createAnswerDto: CreateAnswerDto,
    userId: string,
    userName: string,
  ) {
    return this.prisma.answer.create({
      data: {
        ...createAnswerDto,
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
        question: {
          select: {
            id: true,
            product_id: true,
          },
        },
      },
    });
  }

  /**
   * Get all answers for a question
   */
  async findByQuestion(questionId: string) {
    return this.prisma.answer.findMany({
      where: { question_id: questionId },
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
    });
  }

  /**
   * Get answer by ID
   */
  async findOne(id: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            profile_picture: true,
          },
        },
        question: {
          select: {
            id: true,
            product_id: true,
          },
        },
      },
    });

    if (!answer) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    return answer;
  }

  /**
   * Delete answer (only by the author)
   */
  async remove(id: string, userId: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { id },
      select: { user_id: true },
    });

    if (!answer) {
      throw new NotFoundException('Respuesta no encontrada');
    }

    if (answer.user_id !== userId) {
      throw new Error('No tienes permisos para eliminar esta respuesta');
    }

    return this.prisma.answer.delete({
      where: { id },
    });
  }
}
