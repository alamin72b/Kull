import type { Activity } from "@kull/contracts";
import { Clock3, Pencil, Trash2 } from "lucide-react";
import { formatDuration, formatTime } from "../utils/date";
import styles from "./activities.module.css";

interface ActivityCardProps {
  activity: Activity;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

export function ActivityCard({
  activity,
  onEdit,
  onDelete,
}: ActivityCardProps) {
  return (
    <article className={styles.activityCard}>
      <div className={styles.timeRail} aria-label="Activity time">
        <span>{formatTime(activity.startAt)}</span>
        <span className={styles.timeLine} aria-hidden="true" />
        <span>{formatTime(activity.endAt)}</span>
      </div>

      <div className={styles.activityContent}>
        <div className={styles.activityTitleRow}>
          <div>
            <h3>{activity.name}</h3>
            <p className={styles.duration}>
              <Clock3 size={15} aria-hidden="true" />
              {formatDuration(activity.startAt, activity.endAt)}
            </p>
          </div>

          <div className={styles.cardActions}>
            <button
              className={styles.iconButton}
              type="button"
              onClick={() => onEdit(activity)}
              aria-label={`Edit ${activity.name}`}
              title="Edit activity"
            >
              <Pencil size={17} />
            </button>
            <button
              className={`${styles.iconButton} ${styles.deleteButton}`}
              type="button"
              onClick={() => onDelete(activity)}
              aria-label={`Delete ${activity.name}`}
              title="Delete activity"
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>

        {activity.note && <p className={styles.note}>{activity.note}</p>}
      </div>
    </article>
  );
}
