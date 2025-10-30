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
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Subscriptions controller handling subscription operations
 */
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Create a new subscription (requires authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Request() req,
  ) {
    return this.subscriptionsService.create(createSubscriptionDto, req.user.id);
  }

  /**
   * Get all subscriptions for the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-subscriptions')
  async findMySubscriptions(@Request() req) {
    return this.subscriptionsService.findByUser(req.user.id);
  }

  /**
   * Get active subscription for the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get('active')
  async findActive(@Request() req) {
    return this.subscriptionsService.findActiveByUser(req.user.id);
  }

  /**
   * Get subscription limits for the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get('limits')
  async getLimits(@Request() req) {
    return this.subscriptionsService.getUserLimits(req.user.id);
  }

  /**
   * Check if user can publish more products
   */
  @UseGuards(JwtAuthGuard)
  @Get('can-publish')
  async canPublish(@Request() req) {
    const canPublish = await this.subscriptionsService.canPublishProduct(
      req.user.id,
    );
    return { canPublish };
  }

  /**
   * Check if user can feature more products
   */
  @UseGuards(JwtAuthGuard)
  @Get('can-feature')
  async canFeature(@Request() req) {
    const canFeature = await this.subscriptionsService.canFeatureProduct(
      req.user.id,
    );
    return { canFeature };
  }

  /**
   * Check if user has analytics access
   */
  @UseGuards(JwtAuthGuard)
  @Get('has-analytics')
  async hasAnalytics(@Request() req) {
    const hasAnalytics = await this.subscriptionsService.hasAnalyticsAccess(
      req.user.id,
    );
    return { hasAnalytics };
  }

  /**
   * Get specific subscription by ID
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.subscriptionsService.findOne(id, req.user.id);
  }

  /**
   * Update subscription status
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Request() req,
  ) {
    return this.subscriptionsService.update(
      id,
      updateSubscriptionDto,
      req.user.id,
    );
  }

  /**
   * Cancel subscription
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async cancel(@Param('id') id: string, @Request() req) {
    return this.subscriptionsService.cancel(id, req.user.id);
  }
}
