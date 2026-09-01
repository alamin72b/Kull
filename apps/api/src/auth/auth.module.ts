import { Module } from '@nestjs/common';

import { PrismaModule } from '../common/prisma/prisma.module';

import { ActivityAuthGuard } from './activity-auth.guard';

import { AuthController } from './auth.controller';

import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, ActivityAuthGuard],
  exports: [AuthService, ActivityAuthGuard],
})
export class AuthModule {}
