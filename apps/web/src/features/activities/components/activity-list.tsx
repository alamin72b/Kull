import type { Activity } from "@kull/contracts";
import { ClipboardList } from "lucide-react";
import { ActivityCard } from "./activity-card";
import styles from "./activities.module.css";

interface ActivityListProps {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

export function ActivityList({
  activities,
  isLoading,
  error,
  onEdit,
  onDelete,
}: ActivityListProps) {
  if (isLoading) {
    return (
      <div className={styles.statusCard} role="status">
        Loading activities...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.statusCard} ${styles.errorCard}`} role="alert">
        <strong>Could not load this day.</strong>
        <span>{error}</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon} aria-hidden="true">
          <ClipboardList size={28} />
        </span>
        <h2>No activities for this day</h2>
        <p>Add the first activity when you are ready.</p>
      </div>
    );
  }

  return (
    <div className={styles.activityList}>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
