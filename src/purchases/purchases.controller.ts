import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UpdatePurchaseDto } from './dto/update-purchase.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Purchases controller handling purchase operations
 */
@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  /**
   * Create a new purchase
   */
  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto, @Request() req) {
    return this.purchasesService.create(createPurchaseDto, req.user.id);
  }

  /**
   * Get all purchases for current user
   */
  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('role') role?: 'buyer' | 'seller' | 'all',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    const filters = { status, role, page, limit };
    return this.purchasesService.findAll(req.user.id, filters);
  }

  /**
   * Get purchase by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.purchasesService.findOne(id, req.user.id);
  }

  /**
   * Update purchase status
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePurchaseDto: UpdatePurchaseDto,
    @Request() req,
  ) {
    return this.purchasesService.update(id, updatePurchaseDto, req.user.id);
  }

  /**
   * Cancel purchase
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.purchasesService.remove(id, req.user.id);
  }
}
