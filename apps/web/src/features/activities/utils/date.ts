function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function parseLocalDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function getToday(): string {
  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}`;
}

export function shiftDate(date: string, numberOfDays: number): string {
  const value = parseLocalDate(date);

  value.setUTCDate(value.getUTCDate() + numberOfDays);

  return value.toISOString().slice(0, 10);
}

export function formatLongDate(date: string): string {
  const value = parseLocalDate(date);

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value);
}

export function combineLocalDateTime(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

export function toTimeInput(isoDate: string): string {
  const value = new Date(isoDate);

  return `${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function formatTime(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate));
}

export function formatDuration(startAt: string, endAt: string): string {
  const totalMinutes = Math.round(
    (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000,
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${minutes} min`;
}
