import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Database module providing global access to Prisma service
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
