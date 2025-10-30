import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatMessageDto } from './dto/create-chat-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Chat controller handling chat message operations
 */
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Create a new chat message
   */
  @Post('messages')
  async create(
    @Body() createChatMessageDto: CreateChatMessageDto,
    @Request() req,
  ) {
    return this.chatService.create(
      createChatMessageDto,
      req.user.id,
      req.user.full_name,
    );
  }

  /**
   * Get all chats for current user
   */
  @Get()
  async findAllChats(@Request() req) {
    return this.chatService.findAllChats(req.user.id);
  }

  /**
   * Get all messages for a purchase
   */
  @Get('purchase/:purchaseId')
  async findByPurchase(
    @Param('purchaseId') purchaseId: string,
    @Request() req,
  ) {
    return this.chatService.findByPurchase(purchaseId, req.user.id);
  }

  /**
   * Delete a message
   */
  @Delete('messages/:id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.chatService.remove(id, req.user.id);
  }
}
