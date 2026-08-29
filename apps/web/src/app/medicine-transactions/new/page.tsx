"use client";

import type { CreateMedicineTransactionInput } from "@kull/contracts";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MedicineTransactionForm } from "../../../features/medicine-transactions/medicine-transaction-form";
import { createMedicineTransaction } from "../../../features/medicine-transactions/medicine-transactions.api";
import styles from "../../../features/medicine-transactions/medicine-transactions.module.css";

export default function NewMedicineTransactionPage() {
  const router = useRouter();

  async function saveTransaction(input: CreateMedicineTransactionInput) {
    const transaction = await createMedicineTransaction(input);

    router.push(`/medicine-transactions/${transaction.id}`);
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <header className={styles.editorHeader}>
        <Link className={styles.backLink} href="/medicine-transactions">
          ← Medicine transactions
        </Link>

        <p className={styles.eyebrow}>New transaction</p>
        <h1>Record a medicine purchase</h1>
        <p>Add the medicines and prices from this purchase.</p>
      </header>

      <MedicineTransactionForm
        onSubmit={saveTransaction}
        submitLabel="Save transaction"
      />
    </main>
  );
}
