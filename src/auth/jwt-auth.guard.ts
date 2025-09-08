import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Authentication Guard
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
