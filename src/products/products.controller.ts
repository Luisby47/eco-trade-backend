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
  ParseBoolPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Products controller handling product CRUD operations
 */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  /**
   * Get all products with optional filters
   */
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('condition') condition?: string,
    @Query('gender') gender?: string,
    @Query('location') location?: string,
    @Query('minPrice', new DefaultValuePipe(0), ParseIntPipe) minPrice?: number,
    @Query('maxPrice', new DefaultValuePipe(999999), ParseIntPipe)
    maxPrice?: number,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('status', new DefaultValuePipe('available')) status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit?: number,
    @Query('sortBy', new DefaultValuePipe('created_at')) sortBy?: string,
    @Query('sortOrder', new DefaultValuePipe('desc'))
    sortOrder?: 'asc' | 'desc',
  ) {
    // Convert featured string to boolean only if provided
    let featuredBoolean: boolean | undefined = undefined;
    if (featured !== undefined && featured !== null && featured !== '') {
      featuredBoolean = featured === 'true' || featured === '1';
    }

    const filters = {
      category,
      condition,
      gender,
      location,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice !== 999999 ? maxPrice : undefined,
      search,
      featured: featuredBoolean,
      status,
      page,
      limit,
      sortBy,
      sortOrder,
    };

    return this.productsService.findAll(filters);
  }

  /**
   * Get featured products
   */
  @Get('featured')
  async findFeatured(
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit?: number,
  ) {
    return this.productsService.findFeatured(limit);
  }

  /**
   * Get product categories
   */
  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  /**
   * Get products by seller
   */
  @Get('seller/:sellerId')
  async findBySeller(@Param('sellerId') sellerId: string) {
    return this.productsService.findBySeller(sellerId);
  }

  /**
   * Get my products (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-products')
  async findMyProducts(@Request() req) {
    return this.productsService.findBySeller(req.user.id);
  }

  /**
   * Get product by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * Update product (requires authentication and ownership)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  /**
   * Delete product (requires authentication and ownership)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.productsService.remove(id, req.user.id);
  }
}
