'use client';

import type { Activity, ActivityInput } from '@kull/contracts';
import { useEffect, useState } from 'react';
import {
  createActivity,
  deleteActivity,
  getActivities,
  updateActivity,
} from '../api/activity-api';

function sortByStartTime(activities: Activity[]): Activity[] {
  return [...activities].sort(
    (first, second) =>
      new Date(first.startAt).getTime() - new Date(second.startAt).getTime(),
  );
}

export function useActivities(date: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load(): Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getActivities(date, controller.signal);

        setActivities(result);
      } catch (caughtError) {
        if (
          caughtError instanceof DOMException &&
          caughtError.name === 'AbortError'
        ) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Could not load activities.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [date]);

  async function add(input: ActivityInput): Promise<void> {
    const created = await createActivity(input);

    setActivities((current) => sortByStartTime([...current, created]));
  }

  async function edit(id: string, input: ActivityInput): Promise<void> {
    const updated = await updateActivity(id, input);

    setActivities((current) =>
      sortByStartTime(
        current.map((activity) =>
          activity.id === updated.id ? updated : activity,
        ),
      ),
    );
  }

  async function remove(id: string): Promise<void> {
    await deleteActivity(id);

    setActivities((current) =>
      current.filter((activity) => activity.id !== id),
    );
  }

  return {
    activities,
    isLoading,
    error,
    add,
    edit,
    remove,
  };
}
