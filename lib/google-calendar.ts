import { google } from "googleapis";

function getAuth() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return auth;
}

export async function pushEventsToCalendar(
  events: {
    artistId: string;
    artist: string;
    stage: string;
    day: string;
    startTime: string;
    endTime: string;
    attendees: string[];
  }[]
) {
  const calendar = google.calendar({ version: "v3", auth: getAuth() });
  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? "primary";

  const results = await Promise.allSettled(
    events.map((evt) => {
      const startDateTime = toISO(evt.day, evt.startTime);
      // Handle sets that cross midnight
      const endDay =
        evt.endTime < evt.startTime
          ? nextDay(evt.day)
          : evt.day;
      const endDateTime = toISO(endDay, evt.endTime);

      return calendar.events.insert({
        calendarId,
        requestBody: {
          summary: evt.artist,
          location: `${evt.stage} — Primavera Sound 2026, Barcelona`,
          description: evt.attendees.length
            ? `Going: ${evt.attendees.join(", ")}`
            : "Primavera Sound 2026",
          start: { dateTime: startDateTime, timeZone: "Europe/Madrid" },
          end: { dateTime: endDateTime, timeZone: "Europe/Madrid" },
        },
      });
    })
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error("Some calendar events failed:", failed);
  }
  return results.filter((r) => r.status === "fulfilled").length;
}

function toISO(day: string, time: string) {
  return `${day}T${time}:00`;
}

function nextDay(day: string) {
  const d = new Date(day);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
