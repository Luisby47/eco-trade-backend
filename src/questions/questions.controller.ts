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
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Questions controller handling Q&A operations
 */
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  /**
   * Create a new question (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
    return this.questionsService.create(
      createQuestionDto,
      req.user.id,
      req.user.full_name,
    );
  }

  /**
   * Get all questions for a product
   */
  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return this.questionsService.findByProduct(productId);
  }

  /**
   * Get question by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  /**
   * Delete question (requires authentication and ownership)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.questionsService.remove(id, req.user.id);
  }
}
