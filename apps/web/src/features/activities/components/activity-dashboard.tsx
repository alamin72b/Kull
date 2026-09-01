"use client";

import type { Activity, ActivityInput } from "@kull/contracts";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { logout } from "@/features/auth/auth.api";
import { useActivities } from "../hooks/use-activities";
import { getToday } from "../utils/date";
import { ActivityDateNavigation } from "./activity-date-navigation";
import { ActivityForm } from "./activity-form";
import { ActivityList } from "./activity-list";
import styles from "./activities.module.css";

export function ActivityDashboard() {
  const [selectedDate, setSelectedDate] = useState(getToday);
  const [isCreating, setIsCreating] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { activities, isLoading, error, add, edit, remove } =
    useActivities(selectedDate);
  const isFormOpen = isCreating || editingActivity !== null;

  function closeForm(): void {
    setIsCreating(false);
    setEditingActivity(null);
  }

  function changeDate(date: string): void {
    closeForm();
    setSelectedDate(date);
  }

  async function saveActivity(input: ActivityInput): Promise<void> {
    if (editingActivity) {
      await edit(editingActivity.id, input);
    } else {
      await add(input);
    }
    closeForm();
  }

  async function handleDelete(activity: Activity): Promise<void> {
    const shouldDelete = window.confirm(
      `Delete “${activity.name}”? This action cannot be undone.`,
    );
    if (!shouldDelete) return;

    try {
      await remove(activity.id);
      if (editingActivity?.id === activity.id) closeForm();
    } catch (caughtError) {
      window.alert(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete the activity.",
      );
    }
  }

  async function handleLogout(): Promise<void> {
    setIsLoggingOut(true);
    await logout();
    window.location.assign("/activities/login");
  }

  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <Link className={styles.backLink} href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          All tools
        </Link>

        <header className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>DAILY LOG</p>
            <h1>Activity</h1>
            <p>Record what you did, when you started, and when you finished.</p>
          </div>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => {
              setEditingActivity(null);
              setIsCreating(true);
            }}
          >
            <Plus size={18} aria-hidden="true" />
            Add activity
          </button>
          {error ? (
            <Link className={styles.secondaryButton} href="/activities/login">
              Log in / Register
            </Link>
          ) : !isLoading ? (
            <button
              className={styles.secondaryButton}
              disabled={isLoggingOut}
              onClick={() => void handleLogout()}
              type="button"
            >
              {isLoggingOut ? "Logging out…" : "Log out"}
            </button>
          ) : null}
        </header>

        <ActivityDateNavigation date={selectedDate} onChange={changeDate} />

        <div
          className={`${styles.contentGrid} ${!isFormOpen ? styles.singleColumn : ""}`}
        >
          <section aria-labelledby="activity-list-title">
            <div className={styles.listHeading}>
              <h2 id="activity-list-title">Day entries</h2>
              <span>
                {activities.length} {activities.length === 1 ? "activity" : "activities"}
              </span>
            </div>
            <ActivityList
              activities={activities}
              isLoading={isLoading}
              error={error}
              onEdit={(activity) => {
                setIsCreating(false);
                setEditingActivity(activity);
              }}
              onDelete={(activity) => void handleDelete(activity)}
            />
          </section>

          {isFormOpen && (
            <ActivityForm
              key={editingActivity?.id ?? `new-${selectedDate}`}
              date={selectedDate}
              activity={editingActivity ?? undefined}
              onSubmit={saveActivity}
              onCancel={closeForm}
            />
          )}
        </div>
      </main>
    </>
  );
}
