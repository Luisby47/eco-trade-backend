import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

/**
 * Data Transfer Object for updating user profile
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Nombre completo debe ser texto' })
  @MinLength(2, { message: 'Nombre completo debe tener al menos 2 caracteres' })
  full_name?: string;

  @IsOptional()
  @IsString({ message: 'Ubicación debe ser texto' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Género debe ser texto' })
  @IsIn(['femenino', 'masculino', 'otro'], {
    message: 'Género debe ser femenino, masculino u otro',
  })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'Teléfono debe ser texto' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Foto de perfil debe ser texto' })
  profile_picture?: string;
}
