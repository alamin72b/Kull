import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../common/prisma/prisma.module';
import { MedicineTransactionsController } from './medicine-transactions.controller';
import { MedicineTransactionsService } from './medicine-transactions.service';

@Module({
  imports: [PrismaModule, AuthModule],

  controllers: [MedicineTransactionsController],

  providers: [MedicineTransactionsService],
})
export class MedicineTransactionsModule {}
