/* eslint-disable @next/next/no-img-element */
"use client";

import {
  DEBUG_NOTE_SEVERITIES,
  DEBUG_NOTE_SEVERITY_LABELS,
  DEBUG_NOTE_STATUSES,
  DEBUG_NOTE_STATUS_LABELS,
  type DebugNote,
  type DebugNoteSeverity,
  type DebugNoteStatus,
} from "@kull/contracts/debug-note";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";
import {
  debugNotesRequest,
  getScreenshotUrl,
} from "../debug-notes.api";
import styles from "../debug-notes.module.css";

interface FormState {
  title: string;
  summary: string;
  status: DebugNoteStatus;
  severity: DebugNoteSeverity;
  errorMessage: string;
  context: string;
  stepsToReproduce: string;
  environment: string;
  attemptedSolutions: string;
  rootCause: string;
  solution: string;
  codeSnippet: string;
  verification: string;
  findings: string;
  learnings: string;
  thoughts: string;
  references: string;
  occurredAt: string;
  isPinned: boolean;
  tags: string;
}

interface NewScreenshot {
  id: string;
  file: File;
  caption: string;
}

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

function createInitialState(
  initialData?: DebugNote,
): FormState {
  return {
    title: initialData?.title ?? "",
    summary: initialData?.summary ?? "",
    status: initialData?.status ?? "UNSOLVED",
    severity: initialData?.severity ?? "MEDIUM",
    errorMessage: initialData?.errorMessage ?? "",
    context: initialData?.context ?? "",
    stepsToReproduce:
      initialData?.stepsToReproduce ?? "",
    environment: initialData?.environment ?? "",
    attemptedSolutions:
      initialData?.attemptedSolutions ?? "",
    rootCause: initialData?.rootCause ?? "",
    solution: initialData?.solution ?? "",
    codeSnippet: initialData?.codeSnippet ?? "",
    verification: initialData?.verification ?? "",
    findings: initialData?.findings ?? "",
    learnings: initialData?.learnings ?? "",
    thoughts: initialData?.thoughts ?? "",
    references: initialData?.references ?? "",
    occurredAt: toDateTimeLocal(
      initialData?.occurredAt ?? null,
    ),
    isPinned: initialData?.isPinned ?? false,
    tags:
      initialData?.tags.map((tag) => tag.name).join(", ") ??
      "",
  };
}

function parseTags(value: string): string[] {
  const uniqueTags = new Map<string, string>();

  for (const item of value.split(",")) {
    const tag = item.trim().replace(/\s+/g, " ");

    if (!tag) {
      continue;
    }

    const normalizedTag = tag.toLowerCase();

    if (!uniqueTags.has(normalizedTag)) {
      uniqueTags.set(normalizedTag, tag);
    }
  }

  return [...uniqueTags.values()];
}

interface TextFieldProps {
  label: string;
  description?: string;
  value: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  code?: boolean;
  onChange: (value: string) => void;
}

function TextAreaField({
  label,
  description,
  value,
  required,
  placeholder,
  rows = 5,
  code,
  onChange,
}: TextFieldProps) {
  return (
    <label className={styles.field}>
      <span>
        {label}
        {required && (
          <span className={styles.required}> *</span>
        )}
      </span>

      {description && (
        <small>{description}</small>
      )}

      <textarea
        className={code ? styles.codeInput : undefined}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={rows}
        value={value}
      />
    </label>
  );
}

export function DebugNoteForm({
  initialData,
}: {
  initialData?: DebugNote;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [form, setForm] = useState<FormState>(() =>
    createInitialState(initialData),
  );

  const [existingScreenshots, setExistingScreenshots] =
    useState(initialData?.screenshots ?? []);

  const [removedScreenshotIds, setRemovedScreenshotIds] =
    useState<string[]>([]);

  const [newScreenshots, setNewScreenshots] = useState<
    NewScreenshot[]
  >([]);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField<Key extends keyof FormState>(
    field: Key,
    value: FormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addScreenshots(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!files.length) {
      return;
    }

    const activeExistingCount =
      existingScreenshots.length -
      removedScreenshotIds.length;

    const availableSlots =
      5 - activeExistingCount - newScreenshots.length;

    if (availableSlots <= 0) {
      setError(
        "A debug note can contain a maximum of 5 screenshots.",
      );

      return;
    }

    const acceptedFiles = files.slice(0, availableSlots);

    if (acceptedFiles.length < files.length) {
      setError(
        `Only ${availableSlots} more screenshot${
          availableSlots === 1 ? "" : "s"
        } can be added.`,
      );
    } else {
      setError("");
    }

    setNewScreenshots((current) => [
      ...current,
      ...acceptedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        caption: "",
      })),
    ]);
  }

  function toggleExistingScreenshot(screenshotId: string) {
    setRemovedScreenshotIds((current) =>
      current.includes(screenshotId)
        ? current.filter((id) => id !== screenshotId)
        : [...current, screenshotId],
    );
  }

  function updateExistingCaption(
    screenshotId: string,
    caption: string,
  ) {
    setExistingScreenshots((current) =>
      current.map((screenshot) =>
        screenshot.id === screenshotId
          ? {
              ...screenshot,
              caption,
            }
          : screenshot,
      ),
    );
  }

  function updateNewCaption(
    screenshotId: string,
    caption: string,
  ) {
    setNewScreenshots((current) =>
      current.map((screenshot) =>
        screenshot.id === screenshotId
          ? {
              ...screenshot,
              caption,
            }
          : screenshot,
      ),
    );
  }

  function removeNewScreenshot(screenshotId: string) {
    setNewScreenshots((current) =>
      current.filter(
        (screenshot) => screenshot.id !== screenshotId,
      ),
    );
  }

  async function submitForm(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setIsSaving(true);

    if (
      form.status === "SOLVED" &&
      !form.solution.trim()
    ) {
      setError(
        "Add the final solution before marking the note as solved.",
      );
      setIsSaving(false);
      return;
    }

    const data = new FormData();

    const textFields = {
      title: form.title,
      summary: form.summary,
      status: form.status,
      severity: form.severity,
      errorMessage: form.errorMessage,
      context: form.context,
      stepsToReproduce: form.stepsToReproduce,
      environment: form.environment,
      attemptedSolutions: form.attemptedSolutions,
      rootCause: form.rootCause,
      solution: form.solution,
      codeSnippet: form.codeSnippet,
      verification: form.verification,
      findings: form.findings,
      learnings: form.learnings,
      thoughts: form.thoughts,
      references: form.references,
      occurredAt: form.occurredAt
        ? new Date(form.occurredAt).toISOString()
        : "",
      isPinned: String(form.isPinned),
      tags: JSON.stringify(parseTags(form.tags)),
      screenshotCaptions: JSON.stringify(
        newScreenshots.map(
          (screenshot) => screenshot.caption,
        ),
      ),
    };

    for (const [field, value] of Object.entries(textFields)) {
      data.append(field, value);
    }

    if (isEditing) {
      data.append(
        "removedScreenshotIds",
        JSON.stringify(removedScreenshotIds),
      );

      data.append(
        "existingScreenshotCaptions",
        JSON.stringify(
          Object.fromEntries(
            existingScreenshots.map((screenshot) => [
              screenshot.id,
              screenshot.caption ?? "",
            ]),
          ),
        ),
      );
    }

    for (const screenshot of newScreenshots) {
      data.append("screenshots", screenshot.file);
    }

    try {
      const note = await debugNotesRequest<DebugNote>(
        isEditing
          ? `/debug-notes/${initialData!.id}`
          : "/debug-notes",
        {
          method: isEditing ? "PATCH" : "POST",
          body: data,
        },
      );

      router.push(`/debug-notes/${note.id}`);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save the debug note.",
      );

      setIsSaving(false);
    }
  }

  return (
    <form
      className={styles.noteForm}
      onSubmit={submitForm}
    >
      {error && (
        <div className={styles.formError}>{error}</div>
      )}

      <section
        className={styles.formSection}
        id="identification"
      >
        <div className={styles.sectionHeading}>
          <span>01</span>
          <div>
            <h2>Identification</h2>
            <p>
              Give the problem a recognizable name and classify it.
            </p>
          </div>
        </div>

        <label className={styles.field}>
          <span>
            Title
            <span className={styles.required}> *</span>
          </span>

          <input
            maxLength={160}
            onChange={(event) =>
              updateField("title", event.target.value)
            }
            placeholder="Prisma migration fails after adding a relation"
            required
            type="text"
            value={form.title}
          />
        </label>

        <TextAreaField
          description="A short explanation that will appear in the notes list."
          label="Summary"
          onChange={(value) => updateField("summary", value)}
          placeholder="The migration failed because an existing row could not satisfy the new foreign key."
          rows={3}
          value={form.summary}
        />

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span>Status</span>
            <select
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as DebugNoteStatus,
                )
              }
              value={form.status}
            >
              {DEBUG_NOTE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {DEBUG_NOTE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Severity</span>
            <select
              onChange={(event) =>
                updateField(
                  "severity",
                  event.target
                    .value as DebugNoteSeverity,
                )
              }
              value={form.severity}
            >
              {DEBUG_NOTE_SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {DEBUG_NOTE_SEVERITY_LABELS[severity]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Occurred at</span>
            <input
              onChange={(event) =>
                updateField(
                  "occurredAt",
                  event.target.value,
                )
              }
              type="datetime-local"
              value={form.occurredAt}
            />
          </label>
        </div>

        <label className={styles.checkboxField}>
          <input
            checked={form.isPinned}
            onChange={(event) =>
              updateField("isPinned", event.target.checked)
            }
            type="checkbox"
          />
          <span>Pin this note at the top of the library</span>
        </label>
      </section>

      <section
        className={styles.formSection}
        id="error-context"
      >
        <div className={styles.sectionHeading}>
          <span>02</span>
          <div>
            <h2>Error and context</h2>
            <p>
              Record enough evidence to recognize and reproduce the
              problem later.
            </p>
          </div>
        </div>

        <TextAreaField
          code
          label="Error message"
          onChange={(value) =>
            updateField("errorMessage", value)
          }
          placeholder="Paste the complete useful part of the error here."
          required
          rows={8}
          value={form.errorMessage}
        />

        <TextAreaField
          label="Context"
          onChange={(value) => updateField("context", value)}
          placeholder="What were you working on when the problem appeared?"
          value={form.context}
        />

        <TextAreaField
          description="Write the steps in the same order that causes the error."
          label="Steps to reproduce"
          onChange={(value) =>
            updateField("stepsToReproduce", value)
          }
          placeholder={"1. Start the API\n2. Run the migration\n3. Open the page"}
          value={form.stepsToReproduce}
        />

        <TextAreaField
          description="OS, browser, runtime, package versions, database, branch, or device."
          label="Environment"
          onChange={(value) =>
            updateField("environment", value)
          }
          placeholder={"Node.js: 24\nPostgreSQL: 17\nBrowser: Chrome"}
          rows={4}
          value={form.environment}
        />
      </section>

      <section
        className={styles.formSection}
        id="investigation"
      >
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <h2>Investigation</h2>
            <p>
              Document what did not work and what actually caused
              the issue.
            </p>
          </div>
        </div>

        <TextAreaField
          description="Keeping failed attempts prevents you from repeating the same work."
          label="Attempted solutions"
          onChange={(value) =>
            updateField("attemptedSolutions", value)
          }
          placeholder="What did you try? Why did it not solve the problem?"
          value={form.attemptedSolutions}
        />

        <TextAreaField
          label="Root cause"
          onChange={(value) =>
            updateField("rootCause", value)
          }
          placeholder="What was the real technical reason behind the error?"
          value={form.rootCause}
        />

        <TextAreaField
          label="Important findings"
          onChange={(value) =>
            updateField("findings", value)
          }
          placeholder="Facts discovered while investigating the issue."
          value={form.findings}
        />
      </section>

      <section className={styles.formSection} id="solution">
        <div className={styles.sectionHeading}>
          <span>04</span>
          <div>
            <h2>Solution</h2>
            <p>
              Explain the final fix and how you proved that it
              worked.
            </p>
          </div>
        </div>

        <TextAreaField
          description="Required when the status is Solved."
          label="Final solution"
          onChange={(value) =>
            updateField("solution", value)
          }
          placeholder="Explain the working solution in clear steps."
          rows={7}
          value={form.solution}
        />

        <TextAreaField
          code
          description="Store the reusable command, query, or code change."
          label="Code or commands"
          onChange={(value) =>
            updateField("codeSnippet", value)
          }
          placeholder="pnpm --filter api exec prisma migrate dev"
          rows={8}
          value={form.codeSnippet}
        />

        <TextAreaField
          label="Verification"
          onChange={(value) =>
            updateField("verification", value)
          }
          placeholder="How did you test that the fix worked and did not break anything else?"
          value={form.verification}
        />
      </section>

      <section className={styles.formSection} id="knowledge">
        <div className={styles.sectionHeading}>
          <span>05</span>
          <div>
            <h2>Knowledge</h2>
            <p>
              Save the knowledge that will still be valuable after
              the error is forgotten.
            </p>
          </div>
        </div>

        <TextAreaField
          label="What I learned"
          onChange={(value) =>
            updateField("learnings", value)
          }
          placeholder="What new technical concept did this problem teach you?"
          value={form.learnings}
        />

        <TextAreaField
          label="My thoughts"
          onChange={(value) =>
            updateField("thoughts", value)
          }
          placeholder="Your reasoning, opinions, future improvements, or questions."
          value={form.thoughts}
        />

        <TextAreaField
          description="Put one URL on each line."
          label="References"
          onChange={(value) =>
            updateField("references", value)
          }
          placeholder={"https://docs.example.com/page\nhttps://github.com/example/issue"}
          rows={4}
          value={form.references}
        />

        <label className={styles.field}>
          <span>Tags</span>
          <small>
            Separate tags with commas. Maximum 10 tags.
          </small>

          <input
            onChange={(event) =>
              updateField("tags", event.target.value)
            }
            placeholder="nextjs, nestjs, prisma, postgresql"
            type="text"
            value={form.tags}
          />
        </label>
      </section>

      <section className={styles.formSection} id="screenshots">
        <div className={styles.sectionHeading}>
          <span>06</span>
          <div>
            <h2>Screenshots</h2>
            <p>
              Add up to five PNG, JPEG, or WebP screenshots. Each
              file can be up to 5 MB.
            </p>
          </div>
        </div>

        {existingScreenshots.length > 0 && (
          <div className={styles.screenshotEditorList}>
            {existingScreenshots.map((screenshot) => {
              const removed =
                removedScreenshotIds.includes(screenshot.id);

              return (
                <article
                  className={`${styles.screenshotEditor} ${
                    removed ? styles.screenshotRemoved : ""
                  }`}
                  key={screenshot.id}
                >
                  <img
                    alt={
                      screenshot.caption ||
                      screenshot.originalName
                    }
                    src={getScreenshotUrl(screenshot.url)}
                  />

                  <div>
                    <strong>{screenshot.originalName}</strong>

                    <input
                      disabled={removed}
                      maxLength={200}
                      onChange={(event) =>
                        updateExistingCaption(
                          screenshot.id,
                          event.target.value,
                        )
                      }
                      placeholder="Screenshot caption"
                      type="text"
                      value={screenshot.caption ?? ""}
                    />

                    <button
                      className={styles.textButton}
                      onClick={() =>
                        toggleExistingScreenshot(
                          screenshot.id,
                        )
                      }
                      type="button"
                    >
                      {removed
                        ? "Keep screenshot"
                        : "Remove screenshot"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {newScreenshots.length > 0 && (
          <div className={styles.newScreenshotList}>
            {newScreenshots.map((screenshot) => (
              <div
                className={styles.newScreenshot}
                key={screenshot.id}
              >
                <div>
                  <strong>{screenshot.file.name}</strong>
                  <small>
                    {(screenshot.file.size / 1024).toFixed(1)} KB
                  </small>
                </div>

                <input
                  maxLength={200}
                  onChange={(event) =>
                    updateNewCaption(
                      screenshot.id,
                      event.target.value,
                    )
                  }
                  placeholder="What does this screenshot show?"
                  type="text"
                  value={screenshot.caption}
                />

                <button
                  className={styles.textButton}
                  onClick={() =>
                    removeNewScreenshot(screenshot.id)
                  }
                  type="button"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <label className={styles.filePicker}>
          <span>Select screenshots</span>
          <input
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={addScreenshots}
            type="file"
          />
        </label>
      </section>

      <div className={styles.formActions}>
        <button
          className={styles.primaryButton}
          disabled={isSaving}
          type="submit"
        >
          {isSaving
            ? "Saving…"
            : isEditing
              ? "Update debug note"
              : "Create debug note"}
        </button>

        <button
          className={styles.secondaryButton}
          disabled={isSaving}
          onClick={() => router.back()}
          type="button"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
