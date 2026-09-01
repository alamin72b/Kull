import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";

import { PrismaModule } from "../common/prisma/prisma.module";

import {
  DriveController,
} from "./drive.controller";

import {
  DriveService,
} from "./drive.service";

@Module({
  imports: [
    AuthModule,
    PrismaModule,
  ],

  controllers: [
    DriveController,
  ],

  providers: [
    DriveService,
  ],
  exports: [
    DriveService,
  ],
})
export class DriveModule {}
