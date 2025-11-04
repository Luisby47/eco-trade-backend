import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';

/**
 * Subscriptions service for managing user subscription operations
 */
@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new subscription
   */
  async create(createSubscriptionDto: CreateSubscriptionDto, userId: string) {
    await this.expireOldSubscriptions();

    // Check if user has an active PAID subscription (not basico)
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        user_id: userId,
        status: 'activa',
        end_date: {
          gte: new Date(),
        },
        plan: {
          not: 'basico',
        },
      },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        'Ya tienes una suscripción activa. Cancela la actual antes de crear una nueva.',
      );
    }

    return this.prisma.subscription.create({
      data: {
        ...createSubscriptionDto,
        user_id: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get all subscriptions for a user
   */
  async findByUser(userId: string) {
    return this.prisma.subscription.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get active subscription for a user
   */
  async findActiveByUser(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        user_id: userId,
        status: 'activa',
        end_date: {
          gte: new Date(),
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // If no active subscription found, return default free plan
    if (!subscription) {
      return {
        plan: 'basico',
        featured_products_limit: 1,
        products_limit: 10,
        analytics_enabled: false,
        status: 'activa',
      };
    }

    return subscription;
  }

  /**
   * Get subscription by ID
   */
  async findOne(id: string, userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    if (subscription.user_id !== userId) {
      throw new BadRequestException(
        'No tienes permiso para acceder a esta suscripción',
      );
    }

    return subscription;
  }

  /**
   * Update subscription status
   */
  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
    userId: string,
  ) {
    const subscription = await this.findOne(id, userId);

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: updateSubscriptionDto,
    });
  }

  /**
   * Cancel subscription
   */
  async cancel(id: string, userId: string) {
    const subscription = await this.findOne(id, userId);

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'cancelada' },
    });
  }

  /**
   * Check if user can publish more products
   */
  async canPublishProduct(userId: string): Promise<boolean> {
    const activeSubscription = await this.findActiveByUser(userId);
    const userProductsCount = await this.prisma.product.count({
      where: {
        seller_id: userId,
        status: {
          in: ['available', 'reserved'],
        },
      },
    });

    return userProductsCount < activeSubscription.products_limit;
  }

  /**
   * Check if user can feature more products
   */
  async canFeatureProduct(userId: string): Promise<boolean> {
    const activeSubscription = await this.findActiveByUser(userId);
    const featuredProductsCount = await this.prisma.product.count({
      where: {
        seller_id: userId,
        featured: true,
        status: {
          in: ['available', 'reserved'],
        },
      },
    });

    return featuredProductsCount < activeSubscription.featured_products_limit;
  }

  /**
   * Check if user has analytics enabled
   */
  async hasAnalyticsAccess(userId: string): Promise<boolean> {
    const activeSubscription = await this.findActiveByUser(userId);
    return activeSubscription.analytics_enabled;
  }

  /**
   * Get subscription limits for a user
   */
  async getUserLimits(userId: string) {
    const activeSubscription = await this.findActiveByUser(userId);
    const userProductsCount = await this.prisma.product.count({
      where: {
        seller_id: userId,
        status: {
          in: ['available', 'reserved'],
        },
      },
    });
    const featuredProductsCount = await this.prisma.product.count({
      where: {
        seller_id: userId,
        featured: true,
        status: {
          in: ['available', 'reserved'],
        },
      },
    });

    return {
      plan: activeSubscription.plan,
      products_limit: activeSubscription.products_limit,
      products_used: userProductsCount,
      products_remaining: activeSubscription.products_limit - userProductsCount,
      featured_products_limit: activeSubscription.featured_products_limit,
      featured_products_used: featuredProductsCount,
      featured_products_remaining:
        activeSubscription.featured_products_limit - featuredProductsCount,
      analytics_enabled: activeSubscription.analytics_enabled,
      status: activeSubscription.status,
    };
  }

  /**
   * Expire old subscriptions (to be run as a cron job)
   */
  async expireOldSubscriptions() {
    return this.prisma.subscription.updateMany({
      where: {
        status: 'activa',
        end_date: {
          lt: new Date(),
        },
      },
      data: {
        status: 'expirada',
      },
    });
  }
}
