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

interface Credentials {
  username: string;
  password: string;
}

async function getErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;

  if (Array.isArray(body?.message)) {
    return body.message.join(' ');
  }

  if (typeof body?.message === 'string') {
    return body.message;
  }

  return 'Authentication failed.';
}

async function checkResponse(response: Response): Promise<void> {
  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
}

export async function login(credentials: Credentials): Promise<void> {
  await sendAuthRequest('/auth/login', credentials);
}

export async function register(credentials: Credentials): Promise<void> {
  await sendAuthRequest('/auth/register', credentials);
}

export async function logout(): Promise<void> {
  await fetch(`${getApiUrl()}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

async function sendAuthRequest(
  path: string,
  credentials: Credentials,
): Promise<void> {
  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new Error('The API did not respond. Check that the API is running.');
    }

    throw new Error('Could not connect to the API. Check the API address and CORS settings.');
  }

  await checkResponse(response);
}
