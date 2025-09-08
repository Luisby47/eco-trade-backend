import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Answers controller handling answer operations
 */
@Controller('answers')
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  /**
   * Create a new answer (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createAnswerDto: CreateAnswerDto, @Request() req) {
    return this.answersService.create(
      createAnswerDto,
      req.user.id,
      req.user.full_name,
    );
  }

  /**
   * Get all answers for a question
   */
  @Get('question/:questionId')
  async findByQuestion(@Param('questionId') questionId: string) {
    return this.answersService.findByQuestion(questionId);
  }

  /**
   * Get answer by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.answersService.findOne(id);
  }

  /**
   * Delete answer (requires authentication and ownership)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.answersService.remove(id, req.user.id);
  }
}
