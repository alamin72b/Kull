"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  debugNotesRequest,
} from "../debug-notes.api";
import styles from "../debug-notes.module.css";

export function DeleteDebugNoteButton({
  noteId,
}: {
  noteId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function deleteNote() {
    const confirmed = window.confirm(
      "Delete this debug note and all of its screenshots?",
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await debugNotesRequest<void>(`/debug-notes/${noteId}`, {
        method: "DELETE",
      });

      router.push("/debug-notes");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete the debug note.",
      );

      setIsDeleting(false);
    }
  }

  return (
    <div>
      <button
        className={styles.dangerButton}
        disabled={isDeleting}
        onClick={deleteNote}
        type="button"
      >
        {isDeleting ? "Deleting…" : "Delete"}
      </button>

      {error && (
        <p className={styles.formError}>{error}</p>
      )}
    </div>
  );
}
