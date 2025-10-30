import { IsEmail, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for user registration
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Email debe tener un formato válido' })
  email: string;

  @IsString({ message: 'Password es requerido' })
  @MinLength(6, { message: 'Password debe tener al menos 6 caracteres' })
  password: string;

  @IsString({ message: 'Nombre completo es requerido' })
  @MinLength(2, { message: 'Nombre completo debe tener al menos 2 caracteres' })
  full_name: string;

  @IsString({ message: 'Ubicación es requerida' })
  location: string;

  @IsString({ message: 'Género es requerido' })
  @IsIn(['femenino', 'masculino', 'otro'], {
    message: 'Género debe ser femenino, masculino u otro',
  })
  gender: string;

  @IsString({ message: 'Teléfono es requerido' })
  phone: string;

  @IsOptional()
  @IsString({ message: 'Foto de perfil debe ser texto' })
  profile_picture?: string;
}
