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
 * Data Transfer Object for updating a product
 */
export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Título debe ser texto' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Categoría debe ser texto' })
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
  category?: string;

  @IsOptional()
  @IsString({ message: 'Descripción debe ser texto' })
  description?: string;

  @IsOptional()
  @IsInt({ message: 'Precio debe ser un número entero' })
  @Min(1, { message: 'Precio debe ser mayor a 0' })
  price?: number;

  @IsOptional()
  @IsString({ message: 'Talla debe ser texto' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'Condición debe ser texto' })
  @IsIn(['nuevo', 'poco_uso', 'usado'], {
    message: 'Condición debe ser nuevo, poco_uso o usado',
  })
  condition?: string;

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
  @IsArray({ message: 'Imágenes debe ser un array' })
  @IsString({ each: true, message: 'Cada imagen debe ser una URL válida' })
  images?: string[];

  @IsOptional()
  @IsString({ message: 'Estado debe ser texto' })
  @IsIn(['available', 'reserved', 'sold'], {
    message: 'Estado debe ser available, reserved o sold',
  })
  status?: string;

  @IsOptional()
  @IsBoolean({ message: 'Featured debe ser verdadero o falso' })
  featured?: boolean;
}
