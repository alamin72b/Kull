import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ActivitiesModule } from "./activities/activities.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { DebugNotesModule } from './debug-notes/debug-notes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ActivitiesModule,
    DebugNotesModule,
  ],
})
export class AppModule {}