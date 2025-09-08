import { IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new question
 */
export class CreateQuestionDto {
  @IsString({ message: 'ID del producto es requerido' })
  product_id: string;

  @IsString({ message: 'Pregunta es requerida' })
  question: string;
}
