import styles from "../../features/debug-notes/debug-notes.module.css";

export default function DebugNotesLoading() {
  return (
    <main className={styles.page}>
      <div className={styles.loadingState}>
        Loading debug notes…
      </div>
    </main>
  );
}
