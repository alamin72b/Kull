import Link from "next/link";
import styles from "./app-header.module.css";

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Kull home"
        >
          <span className={styles.mark} aria-hidden="true">
            K
          </span>
          <span>Kull</span>
        </Link>

        <p>Make the day visible.</p>
      </div>
    </header>
  );
}