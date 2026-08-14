import {
  DEBUG_NOTE_SEVERITY_LABELS,
  DEBUG_NOTE_STATUS_LABELS,
  type DebugNoteSeverity,
  type DebugNoteStatus,
} from "@kull/contracts/debug-note";
import styles from "../debug-notes.module.css";

const statusClassNames: Record<DebugNoteStatus, string> = {
  UNSOLVED: styles.statusUnsolved,
  IN_PROGRESS: styles.statusInProgress,
  SOLVED: styles.statusSolved,
};

const severityClassNames: Record<DebugNoteSeverity, string> = {
  LOW: styles.severityLow,
  MEDIUM: styles.severityMedium,
  HIGH: styles.severityHigh,
  CRITICAL: styles.severityCritical,
};

export function StatusBadge({
  status,
}: {
  status: DebugNoteStatus;
}) {
  return (
    <span
      className={`${styles.badge} ${statusClassNames[status]}`}
    >
      {DEBUG_NOTE_STATUS_LABELS[status]}
    </span>
  );
}

export function SeverityBadge({
  severity,
}: {
  severity: DebugNoteSeverity;
}) {
  return (
    <span
      className={`${styles.badge} ${severityClassNames[severity]}`}
    >
      {DEBUG_NOTE_SEVERITY_LABELS[severity]}
    </span>
  );
}
