import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PrismaService } from '../common/prisma/prisma.service';

import { KULL_SESSION_COOKIE } from './auth.constants';

import type { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class ActivityAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    /*
     * Get the signed Kull session cookie.
     */
    const userId = request.signedCookies?.[KULL_SESSION_COOKIE];

    /*
     * User is not logged in.
     */
    if (!userId || typeof userId !== 'string') {
      throw new UnauthorizedException('Please log in first.');
    }

    /*
     * Find the Kull user.
     */
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
      },
    });

    /*
     * The session points to a user
     * that doesn't exist anymore.
     */
    if (!user || !user.email) {
      throw new UnauthorizedException('Your login session is invalid.');
    }

    /*
     * Put the user on the request.
     *
     * Controllers can access it
     * through @CurrentUserId().
     */
    request.activityUser = {
      ...user,
      email: user.email,
    };

    return true;
  }
}
