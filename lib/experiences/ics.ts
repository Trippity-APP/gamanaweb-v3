/** Client-generated calendar file for a booked experience (RFC 5545). Pure, no imports. */

export type IcsEvent = {
  uid: string;
  title: string;
  /** `YYYY-MM-DD` in the experience's local time. */
  date: string;
  /** `HH:MM`; omitted → all-day event. */
  time?: string | null;
  durationMinutes?: number | null;
  location?: string | null;
  description?: string | null;
  url?: string | null;
};

function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** Lines longer than 75 octets are folded with CRLF + space. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 74) parts.push((i === 0 ? "" : " ") + line.slice(i, i + 74));
  return parts.join("\r\n");
}

const pad = (n: number) => String(n).padStart(2, "0");

function floating(date: string, time: string): string {
  return `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
}

function addMinutes(date: string, time: string, minutes: number): { date: string; time: string } {
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, h, min + minutes));
  return {
    date: `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`,
    time: `${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}`,
  };
}

function nextDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(dt.getUTCDate())}`;
}

export function buildIcs(event: IcsEvent, now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Gamana//Experiences//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT"];
  lines.push(`UID:${event.uid}@gamana.app`, `DTSTAMP:${stamp}`);
  if (event.time && /^\d{2}:\d{2}$/.test(event.time)) {
    const end = addMinutes(event.date, event.time, event.durationMinutes && event.durationMinutes > 0 ? event.durationMinutes : 120);
    lines.push(`DTSTART:${floating(event.date, event.time)}`, `DTEND:${floating(end.date, end.time)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${event.date.replace(/-/g, "")}`, `DTEND;VALUE=DATE:${nextDay(event.date)}`);
  }
  lines.push(`SUMMARY:${escapeText(event.title)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  if (event.url) lines.push(`URL:${event.url}`);
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs(event: IcsEvent, filename = "gamana-booking.ics"): void {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
