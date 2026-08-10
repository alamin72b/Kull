import type { Activity, ActivityInput } from '@kull/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

interface ApiErrorBody {
  message?: string | string[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';

    try {
      const body = (await response.json()) as ApiErrorBody;

      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // Keep the fallback message if the server returns non-JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getActivities(
  date: string,
  signal?: AbortSignal,
): Promise<Activity[]> {
  return request<Activity[]>(`/activities?date=${encodeURIComponent(date)}`, {
    signal,
  });
}

export function createActivity(input: ActivityInput): Promise<Activity> {
  return request<Activity>('/activities', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateActivity(
  id: string,
  input: ActivityInput,
): Promise<Activity> {
  return request<Activity>(`/activities/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteActivity(id: string): Promise<void> {
  return request<void>(`/activities/${id}`, {
    method: 'DELETE',
  });
}
