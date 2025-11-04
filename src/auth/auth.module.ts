import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

/**
 * Authentication module handling user login, registration, and JWT tokens
 */
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const rawExpiresIn = configService.get<string>('JWT_EXPIRES_IN');

        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: normalizeExpiresIn(rawExpiresIn),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

const MS_UNITS = new Set(['ms', 's', 'm', 'h', 'd', 'w', 'y']);

/**
 * Normalizes the JWT expiration value from configuration so it matches the
 * allowed types (`number` seconds or a duration string like `15m`).
 */
function normalizeExpiresIn(value?: string): number | StringValue | undefined {
  if (!value) {
    return undefined;
  }

  const numeric = Number(value);

  if (!Number.isNaN(numeric)) {
    return numeric;
  }

  const trimmed = value.trim();
  const unit = trimmed.replace(/^[\d.\s-]+/, '').toLowerCase();

  if (unit && MS_UNITS.has(unit)) {
    return trimmed as StringValue;
  }

  throw new Error(
    `Invalid JWT_EXPIRES_IN value: "${value}". Use a number of seconds or a valid ms-duration string (e.g., 15m, 24h).`,
  );
}
