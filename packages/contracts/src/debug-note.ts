export type DebugNoteStatus = 'UNSOLVED' | 'IN_PROGRESS' | 'SOLVED';

export interface DebugScreenshot {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
}

export interface DebugNote {
  id: string;
  title: string;
  summary: string | null;
  errorMessage: string;
  context: string | null;
  stepsToReproduce: string | null;
  environment: string | null;
  rootCause: string | null;
  solution: string | null;
  verification: string | null;
  findings: string | null;
  learnings: string | null;
  status: DebugNoteStatus;
  isPinned: boolean;
  occurredAt: string | null;
  tags: string[];
  screenshots: DebugScreenshot[];
  createdAt: string;
  updatedAt: string;
}

export interface DebugNoteInput {
  title: string;
  summary?: string | null;
  errorMessage: string;
  context?: string | null;
  stepsToReproduce?: string | null;
  environment?: string | null;
  rootCause?: string | null;
  solution?: string | null;
  verification?: string | null;
  findings?: string | null;
  learnings?: string | null;
  status: DebugNoteStatus;
  isPinned: boolean;
  occurredAt?: string | null;
  tags: string[];
  removeScreenshotIds?: string[];
}
