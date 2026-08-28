-- CreateTable
CREATE TABLE "MedicineTransaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicineTransactionItem" (
    "id" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "actualMedicineName" VARCHAR(160) NOT NULL,
    "genericName" VARCHAR(160) NOT NULL,
    "normalizedGenericName" VARCHAR(160) NOT NULL,
    "mrpPerTablet" DECIMAL(10,2) NOT NULL,
    "boughtPricePerTablet" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "MedicineTransactionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicineTransaction_userId_createdAt_idx" ON "MedicineTransaction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MedicineTransactionItem_normalizedGenericName_transactionId_idx" ON "MedicineTransactionItem"("normalizedGenericName", "transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineTransactionItem_transactionId_position_key" ON "MedicineTransactionItem"("transactionId", "position");

-- AddForeignKey
ALTER TABLE "MedicineTransaction" ADD CONSTRAINT "MedicineTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicineTransactionItem" ADD CONSTRAINT "MedicineTransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "MedicineTransaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
