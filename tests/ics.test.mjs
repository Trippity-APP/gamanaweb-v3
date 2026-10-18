import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIcs } from "../lib/experiences/ics.ts";

const NOW = new Date("2026-10-18T09:30:00.000Z");

test("timed event uses floating local times and the given duration", () => {
  const ics = buildIcs({ uid: "b1", title: "Old Delhi walk", date: "2026-11-02", time: "23:30", durationMinutes: 90 }, NOW);
  const lines = ics.split("\r\n");
  assert.ok(ics.endsWith("\r\n"));
  assert.equal(lines[0], "BEGIN:VCALENDAR");
  assert.ok(lines.includes("UID:b1@gamana.app"));
  assert.ok(lines.includes("DTSTAMP:20261018T093000Z"));
  assert.ok(lines.includes("DTSTART:20261102T233000"));
  assert.ok(lines.includes("DTEND:20261103T010000"));
});

test("timed event defaults to two hours", () => {
  const ics = buildIcs({ uid: "b2", title: "x", date: "2026-11-02", time: "10:00" }, NOW);
  assert.ok(ics.includes("DTEND:20261102T120000"));
});

test("event without a time is all-day, ending the next day", () => {
  const ics = buildIcs({ uid: "b3", title: "x", date: "2026-12-31" }, NOW);
  assert.ok(ics.includes("DTSTART;VALUE=DATE:20261231"));
  assert.ok(ics.includes("DTEND;VALUE=DATE:20270101"));
});

test("text fields are escaped and long lines folded", () => {
  const ics = buildIcs(
    { uid: "b4", title: "Food, chai; and more", date: "2026-11-02", location: "Gate 1\nChandni Chowk", description: "d".repeat(100) },
    NOW,
  );
  assert.ok(ics.includes("SUMMARY:Food\\, chai\\; and more"));
  assert.ok(ics.includes("LOCATION:Gate 1\\nChandni Chowk"));
  for (const line of ics.split("\r\n")) assert.ok(line.length <= 75, `line too long: ${line.length}`);
  assert.ok(ics.includes("\r\n d"));
});
