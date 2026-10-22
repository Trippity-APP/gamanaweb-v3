import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeUnlocks, parseLibraryUnlocks, parseToursMine, withDisplayData, withoutWalkStops } from "../lib/library/unlocks.ts";

test("withoutWalkStops hides places that came with an unlocked walk", () => {
  const places = [{ place_id: "stop1" }, { place_id: "story1" }, { place_id: "stop2" }];
  assert.deepEqual(withoutWalkStops(places, new Set(["stop1", "stop2"])).map((u) => u.place_id), ["story1"]);
  assert.equal(withoutWalkStops(places, new Set()), places);
});

test("parseLibraryUnlocks keeps paid and pending unlocks, drops free places", () => {
  const { places, storylists } = parseLibraryUnlocks({
    places: [
      { place_id: "p1", expires_at: "2026-12-01T00:00:00Z" },
      { place_id: "free", expires_at: null },
      { place_id: "p2", expires_at: null, activation_status: "pending" },
      { expires_at: "2026-12-01T00:00:00Z" },
    ],
    storylists: [{ storylist_id: "s1", expires_at: "2026-12-01T00:00:00Z" }, { storylist_id: "s2" }],
  });
  assert.deepEqual(places.map((u) => u.place_id), ["p1", "p2"]);
  assert.deepEqual(storylists.map((u) => u.storylist_id), ["s1"]);
});

test("parseLibraryUnlocks tolerates missing or malformed data", () => {
  assert.deepEqual(parseLibraryUnlocks(null), { places: [], storylists: [] });
  assert.deepEqual(parseLibraryUnlocks([]), { places: [], storylists: [] });
  assert.deepEqual(parseLibraryUnlocks({ places: "x" }), { places: [], storylists: [] });
});

test("parseToursMine maps tour cards to storylist rows", () => {
  const rows = parseToursMine([
    { id: "t1", title: "Old Delhi", cover_image_url: "https://img/1.jpg", is_unlocked: true, expires_at: null },
    { title: "no id" },
  ]);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].storylist_id, "t1");
  assert.equal(rows[0].image_url, "https://img/1.jpg");
  assert.equal(rows[0].title, "Old Delhi");
});

test("mergeUnlocks de-duplicates by id and fills missing display fields", () => {
  const merged = mergeUnlocks(
    [{ storylist_id: "s1", expires_at: "2026-12-01T00:00:00Z" }],
    [{ storylist_id: "s1", title: "Walk", image_url: "i.jpg" }, { storylist_id: "s2", title: "Other" }],
  );
  assert.equal(merged.length, 2);
  assert.equal(merged[0].expires_at, "2026-12-01T00:00:00Z");
  assert.equal(merged[0].title, "Walk");
  assert.equal(merged[0].image_url, "i.jpg");
});

test("withDisplayData joins catalogue data by id without overwriting", () => {
  const lookup = new Map([
    ["p1", { title: "Red Fort", image_url: "rf.jpg", city: "Delhi" }],
    ["p2", { title: "Ignored" }],
  ]);
  const out = withDisplayData([{ place_id: "p1" }, { place_id: "p2", title: "Kept" }, { place_id: "p3" }], lookup);
  assert.deepEqual(
    out.map((u) => [u.title, u.city]),
    [["Red Fort", "Delhi"], ["Kept", undefined], [undefined, undefined]],
  );
});
