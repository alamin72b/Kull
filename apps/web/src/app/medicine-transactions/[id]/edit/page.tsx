"use client";

import type {
  CreateMedicineTransactionInput,
  MedicineTransactionDetail,
} from "@kull/contracts";
import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import { useEffect, useState } from "react";
import { MedicineTransactionForm } from "../../../../features/medicine-transactions/medicine-transaction-form";
import {
  getMedicineTransaction,
  updateMedicineTransaction,
} from "../../../../features/medicine-transactions/medicine-transactions.api";
import styles from "../../../../features/medicine-transactions/medicine-transactions.module.css";

export default function EditMedicineTransactionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [transaction, setTransaction] =
    useState<MedicineTransactionDetail | null>(
      null,
    );

  const [isLoading, setIsLoading] = useState(true);
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

  async function saveChanges(
    input: CreateMedicineTransactionInput,
  ) {
    await updateMedicineTransaction(
      params.id,
      input,
    );

    router.push(
      `/medicine-transactions/${params.id}`,
    );

    router.refresh();
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
      <header className={styles.editorHeader}>
        <Link
          className={styles.backLink}
          href={`/medicine-transactions/${transaction.id}`}
        >
          ← Transaction details
        </Link>

        <p className={styles.eyebrow}>
          Edit transaction
        </p>

        <h1>Update medicines</h1>

        <p>
          Change, add or remove medicine rows.
        </p>
      </header>

      <MedicineTransactionForm
        initialTransaction={transaction}
        onSubmit={saveChanges}
        submitLabel="Save changes"
      />
    </main>
  );
}
