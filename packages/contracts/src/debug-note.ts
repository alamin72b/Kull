export const DEBUG_NOTE_STATUSES = [
  "UNSOLVED",
  "IN_PROGRESS",
  "SOLVED",
] as const;

export type DebugNoteStatus = (typeof DEBUG_NOTE_STATUSES)[number];

export const DEBUG_NOTE_SEVERITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export type DebugNoteSeverity = (typeof DEBUG_NOTE_SEVERITIES)[number];

export const DEBUG_NOTE_STATUS_LABELS: Record<DebugNoteStatus, string> = {
  UNSOLVED: "Unsolved",
  IN_PROGRESS: "In progress",
  SOLVED: "Solved",
};

export const DEBUG_NOTE_SEVERITY_LABELS: Record<DebugNoteSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export interface DebugTag {
  id: string;
  name: string;
  normalizedName: string;
  createdAt: string;
}

export interface DebugScreenshot {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  caption: string | null;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface DebugNote {
  id: string;
  title: string;
  summary: string | null;
  status: DebugNoteStatus;
  severity: DebugNoteSeverity;
  errorMessage: string;
  context: string | null;
  stepsToReproduce: string | null;
  environment: string | null;
  attemptedSolutions: string | null;
  rootCause: string | null;
  solution: string | null;
  codeSnippet: string | null;
  verification: string | null;
  findings: string | null;
  learnings: string | null;
  thoughts: string | null;
  references: string | null;
  occurredAt: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  tags: DebugTag[];
  screenshots: DebugScreenshot[];
}

export interface DebugNotesResponse {
  items: DebugNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DebugNotesQuery {
  q?: string;
  status?: DebugNoteStatus;
  severity?: DebugNoteSeverity;
  tag?: string;
  page?: number;
  limit?: number;
}