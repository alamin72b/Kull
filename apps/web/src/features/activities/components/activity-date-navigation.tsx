
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatLongDate, getToday, shiftDate } from "../utils/date";
import styles from "./activities.module.css";

interface ActivityDateNavigationProps {
  date: string;
  onChange: (date: string) => void;
}

export function ActivityDateNavigation({
  date,
  onChange,
}: ActivityDateNavigationProps) {
  return (
    <nav className={styles.dateNavigation} aria-label="Activity date navigation">
      <button
        className={styles.iconButton}
        type="button"
        onClick={() => onChange(shiftDate(date, -1))}
        aria-label="Previous day"
        title="Previous day"
      >
        <ChevronLeft size={19} />
      </button>

      <div className={styles.selectedDate}>
        <label htmlFor="activity-date">Selected date</label>
        <strong>{formatLongDate(date)}</strong>
        <input
          id="activity-date"
          type="date"
          value={date}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      <button
        className={styles.todayButton}
        type="button"
        onClick={() => onChange(getToday())}
      >
        Today
      </button>

      <button
        className={styles.iconButton}
        type="button"
        onClick={() => onChange(shiftDate(date, 1))}
        aria-label="Next day"
        title="Next day"
      >
        <ChevronRight size={19} />
      </button>
    </nav>
  );
}
