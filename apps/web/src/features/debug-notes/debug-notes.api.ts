import type {
  DebugNote,
  DebugNotesQuery,
  DebugNotesResponse,
  DebugTag,
} from "@kull/contracts/debug-note";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class DebugNotesApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "DebugNotesApiError";
  }
}

async function getErrorMessage(response: Response): Promise<string> {
  const payload = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(payload?.message)) {
    return payload.message.join(", ");
  }

  if (typeof payload?.message === "string") {
    return payload.message;
  }

  return "Something went wrong while communicating with the API.";
}

async function checkResponse(response: Response): Promise<void> {
  if (!response.ok) {
    throw new DebugNotesApiError(
      await getErrorMessage(response),
      response.status,
    );
  }
}

export async function debugNotesRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: "no-store",
  });

  await checkResponse(response);

  const text = await response.text();
  let payload: unknown;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  return payload as T;
}

export function getDebugNotes(
  query: DebugNotesQuery = {},
): Promise<DebugNotesResponse> {
  const searchParams = new URLSearchParams();

  if (query.q) {
    searchParams.set("q", query.q);
  }

  if (query.status) {
    searchParams.set("status", query.status);
  }

  if (query.severity) {
    searchParams.set("severity", query.severity);
  }

  if (query.tag) {
    searchParams.set("tag", query.tag);
  }

  if (query.page) {
    searchParams.set("page", String(query.page));
  }

  if (query.limit) {
    searchParams.set("limit", String(query.limit));
  }

  const search = searchParams.toString();

  return debugNotesRequest<DebugNotesResponse>(
    `/debug-notes${search ? `?${search}` : ""}`,
  );
}

export function getDebugNote(id: string): Promise<DebugNote> {
  return debugNotesRequest<DebugNote>(`/debug-notes/${id}`);
}

export function getDebugTags(): Promise<DebugTag[]> {
  return debugNotesRequest<DebugTag[]>("/debug-notes/tags");
}

export function getScreenshotUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  try {
    return new URL(path, `${API_URL}/`).toString();
  } catch {
    return path;
  }
}
