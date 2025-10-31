import { IsString, IsInt, IsIn, IsBoolean, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Data Transfer Object for creating a subscription
 */
export class CreateSubscriptionDto {
  @IsString({ message: 'Plan debe ser texto' })
  @IsIn(['basico', 'premium', 'profesional'], {
    message: 'Plan debe ser basico, premium o profesional',
  })
  plan: string;

  @IsString({ message: 'Ciclo de facturación debe ser texto' })
  @IsIn(['mensual', 'anual'], {
    message: 'Ciclo de facturación debe ser mensual o anual',
  })
  billing_cycle: string;

  @Type(() => Number)
  @IsInt({ message: 'Precio debe ser un número entero' })
  @Min(0, { message: 'Precio debe ser mayor o igual a 0' })
  price: number;

  @IsDateString({}, { message: 'Fecha de inicio debe ser una fecha válida' })
  start_date: string;

  @IsDateString({}, { message: 'Fecha de fin debe ser una fecha válida' })
  end_date: string;

  @Type(() => Number)
  @IsInt({ message: 'Límite de productos destacados debe ser un número entero' })
  @Min(0, { message: 'Límite debe ser mayor o igual a 0' })
  featured_products_limit: number;

  @Type(() => Number)
  @IsInt({ message: 'Límite de productos debe ser un número entero' })
  @Min(1, { message: 'Límite debe ser mayor o igual a 1' })
  products_limit: number;

  @Type(() => Boolean)
  @IsBoolean({ message: 'Analytics enabled debe ser booleano' })
  analytics_enabled: boolean;
}
