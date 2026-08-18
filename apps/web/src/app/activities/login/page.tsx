'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { login, register } from '@/features/auth/activity-auth.api';
import styles from '@/features/activities/components/activities.module.css';

export default function ActivityLoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const credentials = { username, password };
      if (isRegistering) {
        await register(credentials);
      } else {
        await login(credentials);
      }

      window.location.assign('/activities');
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Authentication failed.',
      );
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <Link className={styles.backLink} href="/activities">
          ← Back to activities
        </Link>

        <section className={styles.formCard} style={{ maxWidth: 520, margin: '48px auto 0' }}>
          <div className={styles.formHeading}>
            <div>
              <p>ACTIVITY ACCESS</p>
              <h1>{isRegistering ? 'Create your account' : 'Log in to activities'}</h1>
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.fullField}>
              Username
              <input
                autoComplete="username"
                minLength={3}
                onChange={(event) => setUsername(event.target.value)}
                required
                value={username}
              />
            </label>

            <label className={styles.fullField}>
              Password
              <input
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>

            {error && <p className={styles.formError}>{error}</p>}

            <div className={styles.formActions}>
              <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Please wait…' : isRegistering ? 'Create account' : 'Log in'}
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setError('');
                  setIsRegistering((current) => !current);
                }}
                type="button"
              >
                {isRegistering ? 'I already have an account' : 'Create a new account'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
