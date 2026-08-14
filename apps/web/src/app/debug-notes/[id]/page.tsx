/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  SeverityBadge,
  StatusBadge,
} from "../../../features/debug-notes/components/DebugNoteBadges";
import { DeleteDebugNoteButton } from "../../../features/debug-notes/components/DeleteDebugNoteButton";
import {
  DebugNotesApiError,
  getDebugNote,
  getScreenshotUrl,
} from "../../../features/debug-notes/debug-notes.api";
import styles from "../../../features/debug-notes/debug-notes.module.css";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function DocumentSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.documentSection} id={id}>
      <div className={styles.documentSectionHeading}>
        <span>{number}</span>
        <h2>{title}</h2>
      </div>

      <div className={styles.documentSectionBody}>
        {children}
      </div>
    </section>
  );
}

function TextBlock({
  title,
  value,
}: {
  title: string;
  value: string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className={styles.textBlock}>
      <h3>{title}</h3>
      <p className={styles.preserveWhitespace}>{value}</p>
    </div>
  );
}

export default async function DebugNotePage({
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

  const references =
    note.references
      ?.split("\n")
      .map((reference) => reference.trim())
      .filter(Boolean) ?? [];

  return (
    <main className={styles.documentPage}>
      <div className={styles.documentToolbar}>
        <Link className={styles.backLink} href="/debug-notes">
          ← Back to Debug Notes
        </Link>

        <div className={styles.documentActions}>
          <Link
            className={styles.primaryButton}
            href={`/debug-notes/${note.id}/edit`}
          >
            Edit note
          </Link>

          <DeleteDebugNoteButton noteId={note.id} />
        </div>
      </div>

      <div className={styles.documentLayout}>
        <aside className={styles.documentSidebar}>
          <p className={styles.documentSidebarLabel}>On this page</p>

          <nav aria-label="On this page">
            <a href="#overview">
              <span>01</span>
              Overview
            </a>
            <a href="#error">
              <span>02</span>
              Error
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

            {note.screenshots.length > 0 && (
              <a href="#screenshots">
                <span>06</span>
                Screenshots
              </a>
            )}
          </nav>

          <div className={styles.documentSidebarMeta}>
            <span>Last updated</span>
            <time dateTime={note.updatedAt}>
              {formatDate(note.updatedAt)}
            </time>
          </div>
        </aside>

        <article className={styles.document}>
          <header className={styles.documentHeader}>
            <p className={styles.documentEyebrow}>
              Debug note / Technical documentation
            </p>

            <div className={styles.badgeRow}>
              <StatusBadge status={note.status} />
              <SeverityBadge severity={note.severity} />

              {note.isPinned && (
                <span className={styles.pinnedLabel}>Pinned</span>
              )}
            </div>

            <h1 className={styles.documentTitle}>{note.title}</h1>

            {note.summary && (
              <p className={styles.documentLead}>
                {note.summary}
              </p>
            )}

            {note.tags.length > 0 && (
              <div className={styles.tagList}>
                {note.tags.map((tag) => (
                  <Link
                    className={styles.tag}
                    href={`/debug-notes?tag=${encodeURIComponent(
                      tag.normalizedName,
                    )}`}
                    key={tag.id}
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            )}

            <dl className={styles.documentMetadata}>
              {note.occurredAt && (
                <div>
                  <dt>Occurred</dt>
                  <dd>
                    <time dateTime={note.occurredAt}>
                      {formatDate(note.occurredAt)}
                    </time>
                  </dd>
                </div>
              )}

              <div>
                <dt>Created</dt>
                <dd>
                  <time dateTime={note.createdAt}>
                    {formatDate(note.createdAt)}
                  </time>
                </dd>
              </div>

              <div>
                <dt>Updated</dt>
                <dd>
                  <time dateTime={note.updatedAt}>
                    {formatDate(note.updatedAt)}
                  </time>
                </dd>
              </div>
            </dl>
          </header>

          <DocumentSection id="overview" number="01" title="Overview">
            <TextBlock title="Context" value={note.context} />

            <TextBlock
              title="Environment"
              value={note.environment}
            />
          </DocumentSection>

          <DocumentSection id="error" number="02" title="Error">
            <div className={styles.textBlock}>
              <h3>Error message</h3>

              <div
                className={`${styles.codeFrame} ${styles.errorFrame}`}
              >
                <div className={styles.codeFrameLabel}>
                  Error output
                </div>
                <pre className={styles.errorCode}>
                  {note.errorMessage}
                </pre>
              </div>
            </div>

            <TextBlock
              title="Steps to reproduce"
              value={note.stepsToReproduce}
            />
          </DocumentSection>

          <DocumentSection
            id="investigation"
            number="03"
            title="Investigation"
          >
            <TextBlock
              title="Attempted solutions"
              value={note.attemptedSolutions}
            />

            <TextBlock
              title="Root cause"
              value={note.rootCause}
            />

            <TextBlock
              title="Important findings"
              value={note.findings}
            />
          </DocumentSection>

          <DocumentSection id="solution" number="04" title="Solution">
            <TextBlock
              title="Final solution"
              value={note.solution}
            />

            {note.codeSnippet && (
              <div className={styles.textBlock}>
                <h3>Code or commands</h3>

                <div
                  className={`${styles.codeFrame} ${styles.solutionFrame}`}
                >
                  <div className={styles.codeFrameLabel}>
                    Code / command
                  </div>
                  <pre className={styles.solutionCode}>
                    {note.codeSnippet}
                  </pre>
                </div>
              </div>
            )}

            <TextBlock
              title="Verification"
              value={note.verification}
            />
          </DocumentSection>

          <DocumentSection
            id="knowledge"
            number="05"
            title="Knowledge"
          >
            <TextBlock
              title="What I learned"
              value={note.learnings}
            />

            <TextBlock
              title="My thoughts"
              value={note.thoughts}
            />

            {references.length > 0 && (
              <div className={styles.textBlock}>
                <h3>References</h3>

                <ul className={styles.referenceList}>
                  {references.map((reference) => {
                    const isLink =
                      reference.startsWith("http://") ||
                      reference.startsWith("https://");

                    return (
                      <li key={reference}>
                        {isLink ? (
                          <a
                            href={reference}
                            rel="noreferrer"
                            target="_blank"
                          >
                            {reference}
                          </a>
                        ) : (
                          reference
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </DocumentSection>

          {note.screenshots.length > 0 && (
            <DocumentSection
              id="screenshots"
              number="06"
              title="Screenshots"
            >
              <div className={styles.screenshotGallery}>
                {note.screenshots.map((screenshot) => (
                  <figure
                    className={styles.screenshotFigure}
                    key={screenshot.id}
                  >
                    <a
                      href={getScreenshotUrl(screenshot.url)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <img
                        alt={
                          screenshot.caption ||
                          screenshot.originalName
                        }
                        src={getScreenshotUrl(
                          screenshot.url,
                        )}
                      />
                    </a>

                    <figcaption>
                      {screenshot.caption ||
                        screenshot.originalName}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </DocumentSection>
          )}
        </article>
      </div>
    </main>
  );
}
