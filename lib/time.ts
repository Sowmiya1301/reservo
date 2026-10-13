export const APP_TZ = "Asia/Colombo";
const OFFSET = "+05:30";

export const OPEN_MIN = 8 * 60; // 08:00
export const CLOSE_MIN = 18 * 60; // 18:00

export function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function toDate(date: string, time: string) {
  return new Date(`${date}T${time}:00${OFFSET}`);
}

export function formatTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: APP_TZ,
  }).format(d);
}

export function todayString() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ }).format(
    new Date()
  );
}

export function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function labelDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

// Monday of the week that contains `date`
export function weekStart(date: string) {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return shiftDate(date, -((dow + 6) % 7));
}