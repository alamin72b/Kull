import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ACTIVITY_SESSION_COOKIE } from './auth.constants';
import type { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class ActivityAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const userId = request.signedCookies?.[ACTIVITY_SESSION_COOKIE];

    if (!userId || typeof userId !== 'string') {
      throw new UnauthorizedException('Log in to access your activities.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Your login session is invalid.');
    }

    request.activityUser = user;

    return true;
  }
}
