"use client";

import type { Activity, ActivityInput } from "@kull/contracts";
import { X } from "lucide-react";
import { FormEvent, useState } from "react";
import { combineLocalDateTime, toTimeInput } from "../utils/date";
import styles from "./activities.module.css";

interface ActivityFormProps {
  date: string;
  activity?: Activity;
  onSubmit: (input: ActivityInput) => Promise<void>;
  onCancel: () => void;
}

export function ActivityForm({
  date,
  activity,
  onSubmit,
  onCancel,
}: ActivityFormProps) {
  const [name, setName] = useState(activity?.name ?? "");
  const [startTime, setStartTime] = useState(
    activity ? toTimeInput(activity.startAt) : "",
  );
  const [endTime, setEndTime] = useState(
    activity ? toTimeInput(activity.endAt) : "",
  );
  const [note, setNote] = useState(activity?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Write an activity name.");
      return;
    }

    if (!startTime || !endTime) {
      setError("Choose both a start time and an end time.");
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: name.trim(),
        activityDate: date,
        startAt: combineLocalDateTime(date, startTime),
        endAt: combineLocalDateTime(date, endTime),
        note: note.trim() || null,
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save the activity.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={styles.formCard} aria-labelledby="activity-form-title">
      <div className={styles.formHeading}>
        <div>
          <p>{activity ? "UPDATE ENTRY" : "NEW ENTRY"}</p>
          <h2 id="activity-form-title">
            {activity ? "Edit activity" : "Add an activity"}
          </h2>
        </div>

        <button
          className={styles.iconButton}
          type="button"
          onClick={onCancel}
          aria-label="Close form"
          title="Close"
        >
          <X size={19} />
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.fullField}>
          <span>Activity name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={120}
            placeholder="For example: Studied NestJS"
            autoFocus
          />
        </label>

        <label>
          <span>Start time</span>
          <input
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
            required
          />
        </label>

        <label>
          <span>End time</span>
          <input
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
            required
          />
        </label>

        <label className={styles.fullField}>
          <span>
            Note <small>Optional</small>
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={1000}
            rows={4}
            placeholder="Add a short detail about this activity"
          />
        </label>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}

        <div className={styles.formActions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={styles.primaryButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : activity
                ? "Save changes"
                : "Add activity"}
          </button>
        </div>
      </form>
    </section>
  );
}
