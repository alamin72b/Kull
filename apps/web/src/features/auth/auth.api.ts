const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export function loginWithGoogle(): void {
  window.location.href = `${API_URL}/auth/google`;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  window.location.href = '/activities/login';
}
