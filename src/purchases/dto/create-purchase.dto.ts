import { IsString, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for creating a new purchase
 */
export class CreatePurchaseDto {
  @IsString({ message: 'ID del producto es requerido' })
  product_id: string;

  @IsString({ message: 'ID del vendedor es requerido' })
  seller_id: string;

  @IsString({ message: 'Nombre del comprador es requerido' })
  buyer_name: string;

  @IsString({ message: 'Email del comprador es requerido' })
  buyer_email: string;

  @IsOptional()
  @IsString({ message: 'Teléfono del comprador debe ser texto' })
  buyer_phone?: string;
}
