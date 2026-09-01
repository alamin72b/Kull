export const KULL_SESSION_COOKIE = 'kull_activity_session';

export const GOOGLE_STATE_COOKIE = 'kull_google_state';

export const GOOGLE_NONCE_COOKIE = 'kull_google_nonce';

export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.RENDER === 'true'
  );
}
