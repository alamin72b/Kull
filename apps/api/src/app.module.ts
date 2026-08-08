import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ActivitiesModule } from "./activities/activities.module";
import { PrismaModule } from "./common/prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ActivitiesModule,
  ],
})
export class AppModule {}