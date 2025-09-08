import { IsString, IsOptional, IsIn } from 'class-validator';

/**
 * Data Transfer Object for updating a purchase
 */
export class UpdatePurchaseDto {
  @IsOptional()
  @IsString({ message: 'Estado debe ser texto' })
  @IsIn(['pending', 'confirmed', 'completed', 'cancelled'], {
    message: 'Estado debe ser pending, confirmed, completed o cancelled',
  })
  status?: string;

  @IsOptional()
  @IsString({ message: 'Nombre del comprador debe ser texto' })
  buyer_name?: string;

  @IsOptional()
  @IsString({ message: 'Email del comprador debe ser texto' })
  buyer_email?: string;

  @IsOptional()
  @IsString({ message: 'Teléfono del comprador debe ser texto' })
  buyer_phone?: string;
}
