import {
  IsString,
  IsInt,
  IsArray,
  IsOptional,
  IsIn,
  IsBoolean,
  Min,
} from 'class-validator';

/**
 * Data Transfer Object for creating a new product
 */
export class CreateProductDto {
  @IsString({ message: 'Título es requerido' })
  title: string;

  @IsString({ message: 'Categoría es requerida' })
  @IsIn(
    [
      'camisas',
      'pantalones',
      'vestidos',
      'zapatos',
      'chaquetas',
      'accesorios',
      'deportiva',
      'otro',
    ],
    { message: 'Categoría debe ser una opción válida' },
  )
  category: string;

  @IsString({ message: 'Descripción es requerida' })
  description: string;

  @IsInt({ message: 'Precio debe ser un número entero' })
  @Min(1, { message: 'Precio debe ser mayor a 0' })
  price: number;

  @IsString({ message: 'Talla es requerida' })
  size: string;

  @IsString({ message: 'Condición es requerida' })
  @IsIn(['nuevo', 'poco_uso', 'usado'], {
    message: 'Condición debe ser nuevo, poco_uso o usado',
  })
  condition: string;

  @IsString({ message: 'Ubicación es requerida' })
  location: string;

  @IsString({ message: 'Género es requerido' })
  @IsIn(['femenino', 'masculino', 'otro'], {
    message: 'Género debe ser femenino, masculino u otro',
  })
  gender: string;

  @IsArray({ message: 'Imágenes debe ser un array' })
  @IsString({ each: true, message: 'Cada imagen debe ser una URL válida' })
  images: string[];

  @IsOptional()
  @IsBoolean({ message: 'Featured debe ser verdadero o falso' })
  featured?: boolean;
}
