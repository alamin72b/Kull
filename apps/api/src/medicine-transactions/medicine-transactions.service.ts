import { Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';

import type { MedicinePriceComparison } from '@kull/contracts';

import { PrismaService } from '../common/prisma/prisma.service';

import {
  CreateMedicineTransactionDto,
  MedicineTransactionItemDto,
} from './dto/create-medicine-transaction.dto';

import { UpdateMedicineTransactionDto } from './dto/update-medicine-transaction.dto';
@Injectable()
export class MedicineTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /*
   * HELPER 1
   *
   * Removes spaces from the beginning and end.
   * It also converts multiple spaces into one space.
   *
   * Example:
   * "  Napa   Extra  " becomes "Napa Extra"
   */
  private cleanName(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }

  /*
   * HELPER 2
   *
   * Converts the generic name to lowercase.
   * This is used for case-insensitive matching.
   *
   * Example:
   * "Paracetamol" becomes "paracetamol"
   * "PARACETAMOL" also becomes "paracetamol"
   */
  private normalizeGenericName(value: string): string {
    const cleanedName = this.cleanName(value);

    return cleanedName.toLowerCase();
  }

  /*
   * HELPER 3
   *
   * Prepares all medicine rows before saving them.
   *
   * It:
   * 1. Cleans the names
   * 2. Creates the normalized generic name
   * 3. Converts price strings to Prisma Decimal
   * 4. Saves the row position
   */
  private prepareMedicines(medicines: MedicineTransactionItemDto[]) {
    return medicines.map((medicine, index) => {
      const actualMedicineName = this.cleanName(medicine.actualMedicineName);

      const genericName = this.cleanName(medicine.genericName);

      const normalizedGenericName = this.normalizeGenericName(genericName);

      return {
        position: index,
        actualMedicineName,
        genericName,
        normalizedGenericName,
        mrpPerTablet: new Prisma.Decimal(medicine.mrpPerTablet),
        boughtPricePerTablet: new Prisma.Decimal(medicine.boughtPricePerTablet),
      };
    });
  }

  /*
   * HELPER 4
   *
   * Compares the current bought price
   * with the previous bought price.
   */
  private comparePrices(
    currentPrice: Prisma.Decimal,
    previousPrice: Prisma.Decimal | null,
  ): MedicinePriceComparison {
    /*
     * If there is no previous price,
     * there is nothing to compare.
     */
    if (previousPrice === null) {
      return {
        previousBoughtPricePerTablet: null,
        currentBoughtPricePerTablet: currentPrice.toFixed(2),
        difference: null,
        result: 'NO_PREVIOUS',
      };
    }

    /*
     * Example:
     *
     * Current = 2.50
     * Previous = 2.00
     * Difference = 0.50
     */
    const difference = currentPrice.minus(previousPrice);

    if (difference.isPositive()) {
      return {
        previousBoughtPricePerTablet: previousPrice.toFixed(2),
        currentBoughtPricePerTablet: currentPrice.toFixed(2),
        difference: difference.toFixed(2),
        result: 'INCREASED',
      };
    }

    if (difference.isNegative()) {
      return {
        previousBoughtPricePerTablet: previousPrice.toFixed(2),
        currentBoughtPricePerTablet: currentPrice.toFixed(2),
        difference: difference.toFixed(2),
        result: 'DECREASED',
      };
    }

    return {
      previousBoughtPricePerTablet: previousPrice.toFixed(2),
      currentBoughtPricePerTablet: currentPrice.toFixed(2),
      difference: '0.00',
      result: 'UNCHANGED',
    };
  }

  /*
   * HELPER 5
   *
   * Finds the most recent earlier medicine
   * with the same generic name.
   *
   * It only searches inside the current user's
   * transactions.
   */
  private async findPreviousPrice(
    userId: string,
    currentTransactionDate: Date,
    normalizedGenericName: string,
  ): Promise<Prisma.Decimal | null> {
    const previousMedicine =
      await this.prisma.medicineTransactionItem.findFirst({
        where: {
          normalizedGenericName,

          transaction: {
            userId,

            createdAt: {
              lt: currentTransactionDate,
            },
          },
        },

        orderBy: [
          {
            transaction: {
              createdAt: 'desc',
            },
          },
          {
            position: 'desc',
          },
        ],

        select: {
          boughtPricePerTablet: true,
        },
      });

    if (!previousMedicine) {
      return null;
    }

    return previousMedicine.boughtPricePerTablet;
  }

  /*
   * HELPER 6
   *
   * Finds one transaction that belongs
   * to the currently logged-in user.
   *
   * If the transaction belongs to another user,
   * this query will not return it.
   */
  private async findOwnedTransaction(userId: string, transactionId: string) {
    const transaction = await this.prisma.medicineTransaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },

      include: {
        medicines: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Medicine transaction not found.');
    }

    return transaction;
  }

  /*
   * CREATE A TRANSACTION
   */
  async create(userId: string, dto: CreateMedicineTransactionDto) {
    const preparedMedicines = this.prepareMedicines(dto.medicines);

    const transaction = await this.prisma.medicineTransaction.create({
      data: {
        userId,

        medicines: {
          create: preparedMedicines,
        },
      },

      select: {
        id: true,
      },
    });

    /*
     * findOne() returns the newly created transaction
     * with all price comparisons.
     */
    return this.findOne(userId, transaction.id);
  }

  /*
   * VIEW ALL TRANSACTIONS
   */
  async findAll(userId: string) {
    const transactions = await this.prisma.medicineTransaction.findMany({
      where: {
        userId,
      },

      include: {
        medicines: {
          orderBy: {
            position: 'asc',
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    /*
     * Prisma Decimal and Date objects are converted
     * into strings before sending them to the frontend.
     */
    return transactions.map((transaction) => {
      return {
        id: transaction.id,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),

        medicines: transaction.medicines.map((medicine) => {
          return {
            id: medicine.id,
            actualMedicineName: medicine.actualMedicineName,
            genericName: medicine.genericName,
            mrpPerTablet: medicine.mrpPerTablet.toFixed(2),
            boughtPricePerTablet: medicine.boughtPricePerTablet.toFixed(2),
          };
        }),
      };
    });
  }

  /*
   * VIEW ONE TRANSACTION
   */
  async findOne(userId: string, transactionId: string) {
    const transaction = await this.findOwnedTransaction(userId, transactionId);

    /*
     * This array will contain the medicines
     * together with their price comparisons.
     */
    const medicinesWithComparison = [];

    /*
     * We check the previous price separately
     * for every medicine.
     */
    for (const medicine of transaction.medicines) {
      const previousPrice = await this.findPreviousPrice(
        userId,
        transaction.createdAt,
        medicine.normalizedGenericName,
      );

      const comparison = this.comparePrices(
        medicine.boughtPricePerTablet,
        previousPrice,
      );

      medicinesWithComparison.push({
        id: medicine.id,
        actualMedicineName: medicine.actualMedicineName,
        genericName: medicine.genericName,
        mrpPerTablet: medicine.mrpPerTablet.toFixed(2),
        boughtPricePerTablet: medicine.boughtPricePerTablet.toFixed(2),
        comparison,
      });
    }

    return {
      id: transaction.id,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      medicines: medicinesWithComparison,
    };
  }

  /*
   * UPDATE A TRANSACTION
   */
  async update(
    userId: string,
    transactionId: string,
    dto: UpdateMedicineTransactionDto,
  ) {
    /*
     * First, make sure that this transaction
     * belongs to the logged-in user.
     */
    await this.findOwnedTransaction(userId, transactionId);

    const preparedMedicines = this.prepareMedicines(dto.medicines);

    /*
     * Remove the old medicine rows.
     * Then create the new medicine rows.
     */
    await this.prisma.medicineTransaction.update({
      where: {
        id: transactionId,
      },

      data: {
        medicines: {
          deleteMany: {},
          create: preparedMedicines,
        },
      },
    });

    return this.findOne(userId, transactionId);
  }

  /*
   * DELETE A TRANSACTION
   */
  async remove(userId: string, transactionId: string): Promise<void> {
    /*
     * First, make sure that this transaction
     * belongs to the logged-in user.
     */
    await this.findOwnedTransaction(userId, transactionId);

    await this.prisma.medicineTransaction.delete({
      where: {
        id: transactionId,
      },
    });
  }
}
