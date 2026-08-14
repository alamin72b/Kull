import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className={styles.page}>
      <header className={styles.editorHeader}>
        <Link
          className={styles.backLink}
          href={`/debug-notes/${note.id}`}
        >
          ← Back to note
        </Link>

        <p className={styles.eyebrow}>Edit documentation</p>
        <h1>{note.title}</h1>
        <p>
          Update the investigation, solution, knowledge, tags, or
          screenshots.
        </p>
      </header>

      <DebugNoteForm initialData={note} />
    </main>
  );
}
