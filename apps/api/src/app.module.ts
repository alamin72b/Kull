import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ActivitiesModule } from "./activities/activities.module";
import { AuthModule } from "./auth/auth.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { DebugNotesModule } from './debug-notes/debug-notes.module';
import { MedicineTransactionsModule } from "./medicine-transactions/medicine-transactions.module";
import { DriveModule } from "./drive/drive.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ActivitiesModule,
    DebugNotesModule,
    MedicineTransactionsModule,
    DriveModule,
  ],
})
export class AppModule {}
