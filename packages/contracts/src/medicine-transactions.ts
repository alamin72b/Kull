export interface MedicineTransactionMedicineInput {
  actualMedicineName: string;
  genericName: string;
  mrpPerTablet: string;
  boughtPricePerTablet: string;
}

export interface CreateMedicineTransactionInput {
  medicines: MedicineTransactionMedicineInput[];
}

export type UpdateMedicineTransactionInput =
  CreateMedicineTransactionInput;

export type MedicinePriceComparisonResult =
  | "INCREASED"
  | "DECREASED"
  | "UNCHANGED"
  | "NO_PREVIOUS";

export interface MedicinePriceComparison {
  previousBoughtPricePerTablet: string | null;
  currentBoughtPricePerTablet: string;
  difference: string | null;
  result: MedicinePriceComparisonResult;
}

export interface MedicineTransactionMedicine {
  id: string;
  actualMedicineName: string;
  genericName: string;
  mrpPerTablet: string;
  boughtPricePerTablet: string;
  comparison?: MedicinePriceComparison;
}

export interface MedicineTransactionSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  medicines: MedicineTransactionMedicine[];
}

export interface MedicineTransactionDetail
  extends MedicineTransactionSummary {
  medicines: Array<
    MedicineTransactionMedicine & {
      comparison: MedicinePriceComparison;
    }
  >;
}