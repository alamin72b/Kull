"use client";

import type {
  CreateMedicineTransactionInput,
  MedicineTransactionDetail,
} from "@kull/contracts";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import styles from "./medicine-transactions.module.css";

interface EditableMedicine {
  rowId: string;
  actualMedicineName: string;
  genericName: string;
  mrpPerTablet: string;
  boughtPricePerTablet: string;
}

interface MedicineTransactionFormProps {
  initialTransaction?: MedicineTransactionDetail;
  submitLabel: string;

  onSubmit: (
    input: CreateMedicineTransactionInput,
  ) => Promise<void>;
}

let nextRowNumber = 1;

/*
 * Creates one empty medicine row.
 */
function createEmptyMedicine(): EditableMedicine {
  const newMedicine = {
    rowId: `new-medicine-${nextRowNumber}`,
    actualMedicineName: "",
    genericName: "",
    mrpPerTablet: "",
    boughtPricePerTablet: "",
  };

  nextRowNumber += 1;

  return newMedicine;
}

export function MedicineTransactionForm({
  initialTransaction,
  submitLabel,
  onSubmit,
}: MedicineTransactionFormProps) {
  /*
   * If we are editing, use the existing medicines.
   *
   * If we are creating, start with one empty row.
   */
  const [medicines, setMedicines] = useState<
    EditableMedicine[]
  >(() => {
    if (initialTransaction) {
      return initialTransaction.medicines.map(
        (medicine) => {
          return {
            rowId: medicine.id,
            actualMedicineName:
              medicine.actualMedicineName,
            genericName: medicine.genericName,
            mrpPerTablet: medicine.mrpPerTablet,
            boughtPricePerTablet:
              medicine.boughtPricePerTablet,
          };
        },
      );
    }

    return [createEmptyMedicine()];
  });

  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  /*
   * Updates the actual medicine name.
   */
  function updateActualName(
    rowId: string,
    value: string,
  ) {
    setMedicines((currentMedicines) => {
      return currentMedicines.map((medicine) => {
        if (medicine.rowId === rowId) {
          return {
            ...medicine,
            actualMedicineName: value,
          };
        }

        return medicine;
      });
    });
  }

  /*
   * Updates the generic name.
   */
  function updateGenericName(
    rowId: string,
    value: string,
  ) {
    setMedicines((currentMedicines) => {
      return currentMedicines.map((medicine) => {
        if (medicine.rowId === rowId) {
          return {
            ...medicine,
            genericName: value,
          };
        }

        return medicine;
      });
    });
  }

  /*
   * Updates the MRP.
   */
  function updateMrp(
    rowId: string,
    value: string,
  ) {
    setMedicines((currentMedicines) => {
      return currentMedicines.map((medicine) => {
        if (medicine.rowId === rowId) {
          return {
            ...medicine,
            mrpPerTablet: value,
          };
        }

        return medicine;
      });
    });
  }

  /*
   * Updates the bought price.
   */
  function updateBoughtPrice(
    rowId: string,
    value: string,
  ) {
    setMedicines((currentMedicines) => {
      return currentMedicines.map((medicine) => {
        if (medicine.rowId === rowId) {
          return {
            ...medicine,
            boughtPricePerTablet: value,
          };
        }

        return medicine;
      });
    });
  }

  /*
   * Adds a new medicine row.
   */
  function addMedicine() {
    const newMedicine = createEmptyMedicine();

    setMedicines((currentMedicines) => {
      return [
        ...currentMedicines,
        newMedicine,
      ];
    });
  }

  /*
   * Removes one medicine row.
   */
  function removeMedicine(rowId: string) {
    if (medicines.length === 1) {
      return;
    }

    setMedicines((currentMedicines) => {
      return currentMedicines.filter(
        (medicine) => medicine.rowId !== rowId,
      );
    });
  }

  /*
   * Saves the complete transaction.
   */
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    const input: CreateMedicineTransactionInput = {
      medicines: medicines.map((medicine) => {
        return {
          actualMedicineName:
            medicine.actualMedicineName.trim(),
          genericName:
            medicine.genericName.trim(),
          mrpPerTablet: medicine.mrpPerTablet,
          boughtPricePerTablet:
            medicine.boughtPricePerTablet,
        };
      }),
    };

    try {
      await onSubmit(input);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(
          "The transaction could not be saved.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  let cancelLink = "/medicine-transactions";

  if (initialTransaction) {
    cancelLink =
      `/medicine-transactions/${initialTransaction.id}`;
  }

  return (
    <form
      className={styles.transactionForm}
      onSubmit={handleSubmit}
    >
      <div className={styles.rowList}>
        {medicines.map((medicine, index) => {
          return (
            <section
              className={styles.medicineRow}
              key={medicine.rowId}
            >
              <div className={styles.rowHeading}>
                <h2>Medicine {index + 1}</h2>

                <button
                  className={styles.removeButton}
                  disabled={medicines.length === 1}
                  onClick={() =>
                    removeMedicine(medicine.rowId)
                  }
                  type="button"
                >
                  Remove
                </button>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  Actual medicine name

                  <input
                    maxLength={160}
                    onChange={(event) =>
                      updateActualName(
                        medicine.rowId,
                        event.target.value,
                      )
                    }
                    required
                    value={medicine.actualMedicineName}
                  />
                </label>

                <label className={styles.field}>
                  Generic name

                  <input
                    maxLength={160}
                    onChange={(event) =>
                      updateGenericName(
                        medicine.rowId,
                        event.target.value,
                      )
                    }
                    required
                    value={medicine.genericName}
                  />
                </label>

                <label className={styles.field}>
                  MRP per tablet

                  <input
                    min="0"
                    onChange={(event) =>
                      updateMrp(
                        medicine.rowId,
                        event.target.value,
                      )
                    }
                    required
                    step="0.01"
                    type="number"
                    value={medicine.mrpPerTablet}
                  />
                </label>

                <label className={styles.field}>
                  Bought price per tablet

                  <input
                    min="0"
                    onChange={(event) =>
                      updateBoughtPrice(
                        medicine.rowId,
                        event.target.value,
                      )
                    }
                    required
                    step="0.01"
                    type="number"
                    value={
                      medicine.boughtPricePerTablet
                    }
                  />
                </label>
              </div>
            </section>
          );
        })}
      </div>

      <button
        className={styles.addButton}
        onClick={addMedicine}
        type="button"
      >
        + Add another medicine
      </button>

      {error && (
        <p className={styles.formError}>
          {error}
        </p>
      )}

      <div className={styles.formActions}>
        <button
          className={styles.primaryButton}
          disabled={isSaving}
          type="submit"
        >
          {isSaving ? "Saving..." : submitLabel}
        </button>

        <Link
          className={styles.secondaryButton}
          href={cancelLink}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
