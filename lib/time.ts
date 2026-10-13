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