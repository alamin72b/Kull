import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SeverityBadge,
  StatusBadge,
} from "../../../../features/debug-notes/components/DebugNoteBadges";
import { DebugNoteForm } from "../../../../features/debug-notes/components/DebugNoteForm";
import {
  DebugNotesApiError,
  getDebugNote,
} from "../../../../features/debug-notes/debug-notes.api";
import styles from "../../../../features/debug-notes/debug-notes.module.css";

export default async function EditDebugNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let note;

  try {
    note = await getDebugNote(id);
  } catch (error) {
    if (
      error instanceof DebugNotesApiError &&
      error.status === 404
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <main className={`${styles.page} ${styles.editPage}`}>
      <header className={`${styles.editorHeader} ${styles.editHeader}`}>
        <div className={styles.editorHeaderTop}>
          <Link
            className={styles.backLink}
            href={`/debug-notes/${note.id}`}
          >
            ← Back to note
          </Link>

          <span className={styles.editorMode}>Document editor</span>
        </div>

        <div className={styles.editorHeaderContent}>
          <div className={styles.editorHeaderCopy}>
            <p className={styles.eyebrow}>Edit documentation</p>
            <h1>Edit debug note</h1>
            <p>
              Refine the investigation while keeping the original
              problem, evidence, and solution easy to scan later.
            </p>
          </div>

          <aside
            aria-label="Current debug note"
            className={styles.currentNoteCard}
          >
            <span>Currently editing</span>
            <strong>{note.title}</strong>

            <div className={styles.badgeRow}>
              <StatusBadge status={note.status} />
              <SeverityBadge severity={note.severity} />
            </div>
          </aside>
        </div>
      </header>

      <div className={styles.editorLayout}>
        <aside className={styles.editorSidebar}>
          <p>Document outline</p>

          <nav aria-label="Edit note sections">
            <a href="#identification">
              <span>01</span>
              Identification
            </a>
            <a href="#error-context">
              <span>02</span>
              Error and context
            </a>
            <a href="#investigation">
              <span>03</span>
              Investigation
            </a>
            <a href="#solution">
              <span>04</span>
              Solution
            </a>
            <a href="#knowledge">
              <span>05</span>
              Knowledge
            </a>
            <a href="#screenshots">
              <span>06</span>
              Screenshots
            </a>
          </nav>

          <small>
            Changes are applied when you select Update debug note.
          </small>
        </aside>

        <div className={styles.editorCanvas}>
          <DebugNoteForm initialData={note} />
        </div>
      </div>
    </main>
  );
}
