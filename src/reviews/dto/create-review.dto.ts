import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

/**
 * Data Transfer Object for creating a new review
 */
export class CreateReviewDto {
  @IsString({ message: 'ID del usuario evaluado es requerido' })
  reviewed_user_id: string;

  @IsOptional()
  @IsString({ message: 'ID de la compra debe ser texto' })
  purchase_id?: string;

  @IsInt({ message: 'Rating debe ser un número entero' })
  @Min(1, { message: 'Rating debe ser mínimo 1' })
  @Max(5, { message: 'Rating debe ser máximo 5' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'Comentario debe ser texto' })
  comment?: string;
}
