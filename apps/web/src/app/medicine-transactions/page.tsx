"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getMedicineTransactions,
} from "../../features/medicine-transactions/medicine-transactions.api";
import type { MedicineTransactionSummary } from "@kull/contracts";
import styles from "../../features/medicine-transactions/medicine-transactions.module.css";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function MedicineTransactionsPage() {
  const [transactions, setTransactions] = useState<
    MedicineTransactionSummary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        setTransactions(await getMedicineTransactions());
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Transactions could not be loaded.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTransactions();
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Medicine Tracker</p>
          <h1>Medicine transactions</h1>
          <p>Keep a history of medicine purchases and price changes.</p>
        </div>

        <Link className={styles.primaryButton} href="/medicine-transactions/new">
          Add transaction
        </Link>
      </header>

      {isLoading && (
        <div className={styles.statePanel}>Loading transactions...</div>
      )}

      {!isLoading && error && (
        <div className={styles.errorPanel}>{error}</div>
      )}

      {!isLoading && !error && transactions.length === 0 && (
        <div className={styles.emptyState}>
          <h2>No transactions yet</h2>
          <p>Add your first medicine purchase to start tracking prices.</p>
        </div>
      )}

      {!isLoading && !error && transactions.length > 0 && (
        <div className={styles.transactionList}>
          {transactions.map((transaction) => (
            <Link
              className={styles.transactionCard}
              href={`/medicine-transactions/${transaction.id}`}
              key={transaction.id}
            >
              <div className={styles.cardTopLine}>
                <span>{formatDate(transaction.createdAt)}</span>
                <span>{transaction.medicines.length} medicine(s)</span>
              </div>

              <h2>Purchase record</h2>

              <div className={styles.medicineNames}>
                {transaction.medicines.map((medicine) => (
                  <span key={medicine.id}>
                    {medicine.actualMedicineName}
                    <small>{medicine.genericName}</small>
                  </span>
                ))}
              </div>

              <span className={styles.openLabel}>Open transaction →</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
