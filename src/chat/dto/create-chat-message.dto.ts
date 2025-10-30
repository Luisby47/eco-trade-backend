import { IsString } from 'class-validator';

/**
 * Data Transfer Object for creating a new chat message
 */
export class CreateChatMessageDto {
  @IsString({ message: 'ID de la compra es requerido' })
  purchase_id: string;

  @IsString({ message: 'Mensaje es requerido' })
  message: string;
}
