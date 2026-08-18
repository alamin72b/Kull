export const ACTIVITY_SESSION_COOKIE = "kull_activity_session";

export function isProductionEnvironment(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.RENDER === "true"
  );
}
