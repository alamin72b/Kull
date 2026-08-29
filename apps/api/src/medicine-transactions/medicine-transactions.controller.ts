import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ActivityAuthGuard } from "../auth/activity-auth.guard";
import { CurrentUserId } from "../auth/current-user-id.decorator";
import { CreateMedicineTransactionDto } from "./dto/create-medicine-transaction.dto";
import { UpdateMedicineTransactionDto } from "./dto/update-medicine-transaction.dto";
import { MedicineTransactionsService } from "./medicine-transactions.service";

@Controller("medicine-transactions")
@UseGuards(ActivityAuthGuard)
export class MedicineTransactionsController {
  constructor(
    private readonly medicineTransactionsService:
      MedicineTransactionsService,
  ) {}

  /*
   * POST /medicine-transactions
   */
  @Post()
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateMedicineTransactionDto,
  ) {
    return this.medicineTransactionsService.create(
      userId,
      dto,
    );
  }

  /*
   * GET /medicine-transactions
   */
  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.medicineTransactionsService.findAll(
      userId,
    );
  }

  /*
   * GET /medicine-transactions/:id
   */
  @Get(":id")
  findOne(
    @CurrentUserId() userId: string,
    @Param("id") transactionId: string,
  ) {
    return this.medicineTransactionsService.findOne(
      userId,
      transactionId,
    );
  }

  /*
   * PATCH /medicine-transactions/:id
   */
  @Patch(":id")
  update(
    @CurrentUserId() userId: string,
    @Param("id") transactionId: string,
    @Body() dto: UpdateMedicineTransactionDto,
  ) {
    return this.medicineTransactionsService.update(
      userId,
      transactionId,
      dto,
    );
  }

  /*
   * DELETE /medicine-transactions/:id
   */
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUserId() userId: string,
    @Param("id") transactionId: string,
  ) {
    return this.medicineTransactionsService.remove(
      userId,
      transactionId,
    );
  }
}