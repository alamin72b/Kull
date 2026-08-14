import type { DebugNote } from "@kull/contracts/debug-note";
import Link from "next/link";
import styles from "../debug-notes.module.css";
import {
  SeverityBadge,
  StatusBadge,
} from "./DebugNoteBadges";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function shorten(value: string, maximumLength = 180): string {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength).trim()}…`;
}

export function DebugNoteCard({
  note,
}: {
  note: DebugNote;
}) {
  return (
    <article className={styles.noteCard}>
      <div className={styles.cardHeading}>
        <div>
          {note.isPinned && (
            <span className={styles.pinnedLabel}>Pinned</span>
          )}

          <h2>
            <Link href={`/debug-notes/${note.id}`}>
              {note.title}
            </Link>
          </h2>
        </div>

        <div className={styles.badgeRow}>
          <StatusBadge status={note.status} />
          <SeverityBadge severity={note.severity} />
        </div>
      </div>

      {note.summary && (
        <p className={styles.cardSummary}>
          {shorten(note.summary)}
        </p>
      )}

      <pre className={styles.cardError}>
        {shorten(note.errorMessage, 240)}
      </pre>

      {note.tags.length > 0 && (
        <div className={styles.tagList}>
          {note.tags.map((tag) => (
            <Link
              key={tag.id}
              className={styles.tag}
              href={`/debug-notes?tag=${encodeURIComponent(
                tag.normalizedName,
              )}`}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      <footer className={styles.cardFooter}>
        <span>
          Updated {formatDate(note.updatedAt)}
        </span>

        {note.screenshots.length > 0 && (
          <span>
            {note.screenshots.length} screenshot
            {note.screenshots.length === 1 ? "" : "s"}
          </span>
        )}
      </footer>
    </article>
  );
}
