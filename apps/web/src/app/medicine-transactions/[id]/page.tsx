"use client";

import type {
  MedicinePriceComparisonResult,
  MedicineTransactionDetail,
} from "@kull/contracts";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteMedicineTransaction,
  getMedicineTransaction,
} from "../../../features/medicine-transactions/medicine-transactions.api";
import styles from "../../../features/medicine-transactions/medicine-transactions.module.css";

function formatMoney(value: string): string {
  const number = Number(value);

  return `৳${number.toFixed(2)}`;
}

function formatDifference(value: string): string {
  const difference = Number(value);

  if (difference > 0) {
    return `+৳${difference.toFixed(2)}`;
  }

  if (difference < 0) {
    return `-৳${Math.abs(difference).toFixed(2)}`;
  }

  return "৳0.00";
}

function getResultText(
  result: MedicinePriceComparisonResult,
): string {
  if (result === "INCREASED") {
    return "Price increased";
  }

  if (result === "DECREASED") {
    return "Price decreased";
  }

  if (result === "UNCHANGED") {
    return "Price unchanged";
  }

  return "No previous price";
}

function getResultClass(
  result: MedicinePriceComparisonResult,
): string {
  if (result === "INCREASED") {
    return styles.priceIncreased;
  }

  if (result === "DECREASED") {
    return styles.priceDecreased;
  }

  return styles.priceUnchanged;
}

function formatDate(value: string): string {
  const date = new Date(value);

  return date.toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MedicineTransactionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [transaction, setTransaction] =
    useState<MedicineTransactionDetail | null>(
      null,
    );

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] =
    useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransaction() {
      try {
        const data =
          await getMedicineTransaction(params.id);

        setTransaction(data);
      } catch (caughtError) {
        if (caughtError instanceof Error) {
          setError(caughtError.message);
        } else {
          setError(
            "Transaction could not be loaded.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadTransaction();
  }, [params.id]);

  async function handleDelete() {
    const shouldDelete = window.confirm(
      "Delete this medicine transaction?",
    );

    if (!shouldDelete) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await deleteMedicineTransaction(params.id);

      router.push("/medicine-transactions");
      router.refresh();
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError(
          "Transaction could not be deleted.",
        );
      }

      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.statePanel}>
          Loading transaction...
        </div>
      </main>
    );
  }

  if (!transaction) {
    return (
      <main className={styles.page}>
        <div className={styles.errorPanel}>
          {error || "Transaction not found."}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.detailHeader}>
        <div>
          <Link
            className={styles.backLink}
            href="/medicine-transactions"
          >
            ← All transactions
          </Link>

          <p className={styles.eyebrow}>
            Complete transaction
          </p>

          <h1>
            {transaction.medicines.length}{" "}
            {transaction.medicines.length === 1
              ? "medicine"
              : "medicines"}
          </h1>

          <p>
            Saved {formatDate(transaction.createdAt)}
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link
            className={styles.secondaryButton}
            href={`/medicine-transactions/${transaction.id}/edit`}
          >
            Edit
          </Link>

          <button
            className={styles.dangerButton}
            disabled={isDeleting}
            onClick={handleDelete}
            type="button"
          >
            {isDeleting
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.errorPanel}>
          {error}
        </div>
      )}

      <div className={styles.comparisonList}>
        {transaction.medicines.map(
          (medicine, index) => {
            const comparison =
              medicine.comparison;

            return (
              <article
                className={styles.comparisonCard}
                key={medicine.id}
              >
                <div
                  className={styles.comparisonHeading}
                >
                  <span>
                    Medicine {index + 1}
                  </span>

                  <div>
                    <h2>
                      {medicine.actualMedicineName}
                    </h2>

                    <p>{medicine.genericName}</p>
                  </div>
                </div>

                <div className={styles.storedPrices}>
                  <div>
                    <span>MRP per tablet</span>

                    <strong>
                      {formatMoney(
                        medicine.mrpPerTablet,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Bought price per tablet
                    </span>

                    <strong>
                      {formatMoney(
                        medicine.boughtPricePerTablet,
                      )}
                    </strong>
                  </div>
                </div>

                {comparison.result ===
                "NO_PREVIOUS" ? (
                  <div
                    className={styles.noComparison}
                  >
                    No previous price is available for
                    this generic medicine.
                  </div>
                ) : (
                  <div
                    className={styles.comparisonResult}
                  >
                    <div>
                      <span>
                        Previous bought price
                      </span>

                      <strong>
                        {formatMoney(
                          comparison
                            .previousBoughtPricePerTablet!,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Current bought price
                      </span>

                      <strong>
                        {formatMoney(
                          comparison
                            .currentBoughtPricePerTablet,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Difference</span>

                      <strong>
                        {formatDifference(
                          comparison.difference!,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Result</span>

                      <strong
                        className={getResultClass(
                          comparison.result,
                        )}
                      >
                        {getResultText(
                          comparison.result,
                        )}
                      </strong>
                    </div>
                  </div>
                )}
              </article>
            );
          },
        )}
      </div>
    </main>
  );
}
