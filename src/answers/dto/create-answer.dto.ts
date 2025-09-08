import { IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new answer
 */
export class CreateAnswerDto {
  @IsString({ message: 'ID de la pregunta es requerido' })
  question_id: string;

  @IsString({ message: 'Respuesta es requerida' })
  answer: string;
}
