import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../common/prisma/prisma.service';
import { ActivityAuthDto } from './dto/activity-auth.dto';

export interface ActivityUser {
  id: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: ActivityAuthDto): Promise<ActivityUser> {
    const username = this.normalizeUsername(dto.username);

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new ConflictException('This username is already being used.');
    }

    const passwordHash = await hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        username,
        passwordHash,
      },
      select: {
        id: true,
        username: true,
      },
    });
  }

  async login(dto: ActivityAuthDto): Promise<ActivityUser> {
    const username = this.normalizeUsername(dto.username);

    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Incorrect username or password.');
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Incorrect username or password.');
    }

    return {
      id: user.id,
      username: user.username,
    };
  }

  private normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
  }
}
