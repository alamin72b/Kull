import Link from "next/link";
import { DebugNoteForm } from "../../../features/debug-notes/components/DebugNoteForm";
import styles from "../../../features/debug-notes/debug-notes.module.css";

export default function NewDebugNotePage() {
  return (
    <main className={styles.page}>
      <header className={styles.editorHeader}>
        <Link
          className={styles.backLink}
          href="/debug-notes"
        >
          ← Debug Notes
        </Link>

        <p className={styles.eyebrow}>New documentation</p>
        <h1>Create debug note</h1>
        <p>
          Only the title and error message are required. Complete
          the other sections when they are useful.
        </p>
      </header>

      <DebugNoteForm />
    </main>
  );
}
