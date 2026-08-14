import {
  DEBUG_NOTE_SEVERITIES,
  DEBUG_NOTE_SEVERITY_LABELS,
  DEBUG_NOTE_STATUSES,
  DEBUG_NOTE_STATUS_LABELS,
  type DebugNoteSeverity,
  type DebugNoteStatus,
} from "@kull/contracts/debug-note";
import Link from "next/link";
import { DebugNoteCard } from "../../features/debug-notes/components/DebugNoteCard";
import {
  getDebugNotes,
  getDebugTags,
} from "../../features/debug-notes/debug-notes.api";
import styles from "../../features/debug-notes/debug-notes.module.css";

type SearchParameters = Promise<
  Record<string, string | string[] | undefined>
>;

function first(
  value: string | string[] | undefined,
): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function paginationUrl(
  values: Record<string, string>,
  page: number,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  searchParams.set("page", String(page));

  return `/debug-notes?${searchParams.toString()}`;
}

export default async function DebugNotesPage({
  searchParams,
}: {
  searchParams: SearchParameters;
}) {
  const parameters = await searchParams;

  const q = first(parameters.q);
  const status = first(parameters.status);
  const severity = first(parameters.severity);
  const tag = first(parameters.tag);
  const page = Math.max(
    1,
    Number(first(parameters.page)) || 1,
  );

  const [response, tags] = await Promise.all([
    getDebugNotes({
      q: q || undefined,
      status:
        status && DEBUG_NOTE_STATUSES.includes(
          status as DebugNoteStatus,
        )
          ? (status as DebugNoteStatus)
          : undefined,
      severity:
        severity && DEBUG_NOTE_SEVERITIES.includes(
          severity as DebugNoteSeverity,
        )
          ? (severity as DebugNoteSeverity)
          : undefined,
      tag: tag || undefined,
      page,
      limit: 12,
    }),
    getDebugTags(),
  ]);

  const paginationValues = {
    q,
    status,
    severity,
    tag,
  };

  return (
    <main className={styles.page}>
      <header className={styles.libraryHeader}>
        <div>
          <Link className={styles.backLink} href="/">
            ← Kull home
          </Link>

          <p className={styles.eyebrow}>Kull / Debug Notes</p>
          <h1>Debug Notes</h1>
          <p>
            Turn errors, investigations, and solutions into a
            searchable personal knowledge base.
          </p>
        </div>

        <Link
          className={styles.primaryButton}
          href="/debug-notes/new"
        >
          Add debug note
        </Link>
      </header>

      <form
        action="/debug-notes"
        className={styles.searchPanel}
      >
        <label className={styles.searchField}>
          <span>Search</span>
          <input
            defaultValue={q}
            name="q"
            placeholder="Search errors, solutions, learnings, or tags…"
            type="search"
          />
        </label>

        <label>
          <span>Status</span>
          <select defaultValue={status} name="status">
            <option value="">All statuses</option>

            {DEBUG_NOTE_STATUSES.map((item) => (
              <option key={item} value={item}>
                {DEBUG_NOTE_STATUS_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Severity</span>
          <select defaultValue={severity} name="severity">
            <option value="">All severities</option>

            {DEBUG_NOTE_SEVERITIES.map((item) => (
              <option key={item} value={item}>
                {DEBUG_NOTE_SEVERITY_LABELS[item]}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Tag</span>
          <select defaultValue={tag} name="tag">
            <option value="">All tags</option>

            {tags.map((item) => (
              <option
                key={item.id}
                value={item.normalizedName}
              >
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <div className={styles.searchActions}>
          <button
            className={styles.primaryButton}
            type="submit"
          >
            Search
          </button>

          <Link
            className={styles.secondaryButton}
            href="/debug-notes"
          >
            Clear
          </Link>
        </div>
      </form>

      <div className={styles.resultSummary}>
        <strong>{response.total}</strong>{" "}
        {response.total === 1 ? "note" : "notes"} found
      </div>

      {response.items.length > 0 ? (
        <div className={styles.noteGrid}>
          {response.items.map((note) => (
            <DebugNoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <section className={styles.emptyState}>
          <h2>No debug notes found</h2>
          <p>
            Change the search filters or create your first debug
            note.
          </p>

          <Link
            className={styles.primaryButton}
            href="/debug-notes/new"
          >
            Create debug note
          </Link>
        </section>
      )}

      {response.totalPages > 1 && (
        <nav
          aria-label="Debug notes pages"
          className={styles.pagination}
        >
          {response.page > 1 ? (
            <Link
              href={paginationUrl(
                paginationValues,
                response.page - 1,
              )}
            >
              ← Previous
            </Link>
          ) : (
            <span />
          )}

          <span>
            Page {response.page} of {response.totalPages}
          </span>

          {response.page < response.totalPages ? (
            <Link
              href={paginationUrl(
                paginationValues,
                response.page + 1,
              )}
            >
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
