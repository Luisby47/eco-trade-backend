import { IsString, IsIn, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for updating a subscription
 */
export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString({ message: 'Estado debe ser texto' })
  @IsIn(['activa', 'cancelada', 'expirada'], {
    message: 'Estado debe ser activa, cancelada o expirada',
  })
  status?: string;
}
