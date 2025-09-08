import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Users controller handling user profile and management operations
 */
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /**
   * Get all users (with pagination)
   */
  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const skip = (pageNum - 1) * limitNum;

    return this.usersService.findAll(skip, limitNum);
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    // Remove sensitive information
    const { password, ...safeUser } = user as any;
    return safeUser;
  }

  /**
   * Update current user profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  /**
   * Update specific user (admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // For now, users can only update their own profile
    // Add admin role check here later if needed
    if (req.user.id !== id && req.user.role !== 'admin') {
      throw new Error('No tienes permisos para actualizar este usuario');
    }

    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete user (admin only)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    // Add proper admin role checking here
    if (req.user.role !== 'admin') {
      throw new Error('No tienes permisos para eliminar usuarios');
    }

    return this.usersService.delete(id);
  }
}
