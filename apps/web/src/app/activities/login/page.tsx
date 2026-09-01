'use client';

import Link from 'next/link';

import { loginWithGoogle } from '../../../features/auth/auth.api';

export default function LoginPage() {
  return (
    <main
      style={{
        width: 'min(420px, calc(100% - 32px))',
        margin: '100px auto',
        textAlign: 'center',
      }}
    >
      <Link href="/">← Kull</Link>

      <h1>Welcome to Kull</h1>

      <p style={{ color: '#667085', lineHeight: 1.6 }}>
        Sign in with your Google account to use your private Kull tools.
      </p>

      <button
        type="button"
        onClick={loginWithGoogle}
        style={{
          width: '100%',
          minHeight: '48px',
          marginTop: '25px',
          border: '1px solid #d0d5dd',
          borderRadius: '8px',
          background: 'white',
          color: '#344054',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Continue with Google
      </button>
    </main>
  );
}
