import type { Activity, ActivityInput } from '@kull/contracts';

function getApiUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;

  if (typeof window !== 'undefined' && configuredUrl) {
    try {
      const url = new URL(configuredUrl);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        url.hostname = window.location.hostname;
      }
      return url.toString().replace(/\/$/, '');
    } catch {
      // Use the development default below for an invalid URL.
    }
  }

  return configuredUrl ?? 'http://localhost:4000/api';
}

interface ApiErrorBody {
  message?: string | string[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.assign('/activities/login');
    }

    throw new Error('Log in to access your activities.');
  }

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
