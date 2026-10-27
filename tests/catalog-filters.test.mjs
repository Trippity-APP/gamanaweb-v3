import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyStoryFilters,
  applyTourFilters,
  buildCategoryOptions,
  countTourFilters,
  DEFAULT_STORY_FILTERS,
  DEFAULT_TOUR_FILTERS,
  haversineKm,
  parseStoryFilters,
  parseTourFilters,
  writeTourFilters,
} from "../lib/catalog-filters.ts";

const tour = (over) => ({
  id: "t",
  title: "T",
  description: "",
  location: "Bengaluru, India",
  duration: "",
  price: 0,
  rating: 4.7,
  reviews: 0,
  tier: "silver",
  category: "Historical",
  image: "",
  highlights: [],
  narrator: "N",
  isPremium: false,
  ...over,
});

const BLR = { lat: 12.9716, lng: 77.5946 };

test("haversineKm measures Bengaluru to Mysuru at roughly 128 km", () => {
  const km = haversineKm(BLR, { lat: 12.2958, lng: 76.6394 });
  assert.ok(km > 120 && km < 135, `got ${km}`);
});

test("story radius filter keeps places within the radius and sorts nearest first", () => {
  const near = tour({ id: "near", geo: { lat: 12.975, lng: 77.6 } });
  const mid = tour({ id: "mid", geo: { lat: 13.05, lng: 77.6 } });
  const far = tour({ id: "far", geo: { lat: 12.2958, lng: 76.6394 } });
  const noGeo = tour({ id: "nogeo" });
  const out = applyStoryFilters([far, noGeo, mid, near], { ...DEFAULT_STORY_FILTERS, radius: "10" }, { origin: BLR });
  assert.deepEqual(out.map((t) => t.id), ["near", "mid"]);

  const all = applyStoryFilters([far, noGeo, mid, near], DEFAULT_STORY_FILTERS, { origin: BLR });
  assert.deepEqual(all.map((t) => t.id), ["near", "mid", "far", "nogeo"]);
});

test("story radius is ignored without a selected city", () => {
  const out = applyStoryFilters([tour({ id: "a" })], { ...DEFAULT_STORY_FILTERS, radius: "5" }, {});
  assert.equal(out.length, 1);
});

test("story flags and unlocked use place fields and the library", () => {
  const items = [tour({ id: "f", isFeatured: true }), tour({ id: "l", isLegend: true }), tour({ id: "p", price: 3 })];
  assert.deepEqual(applyStoryFilters(items, { ...DEFAULT_STORY_FILTERS, flag: "featured" }).map((t) => t.id), ["f"]);
  assert.deepEqual(applyStoryFilters(items, { ...DEFAULT_STORY_FILTERS, flag: "legend" }).map((t) => t.id), ["l"]);
  assert.deepEqual(
    applyStoryFilters(items, { ...DEFAULT_STORY_FILTERS, flag: "unlocked" }, { unlockedIds: new Set(["p"]) }).map((t) => t.id),
    ["p"],
  );
  assert.deepEqual(applyStoryFilters(items, { ...DEFAULT_STORY_FILTERS, price: "premium" }).map((t) => t.id), ["p"]);
});

test("tour buckets match the backend's non-overlapping ranges", () => {
  const items = [
    tour({ id: "short", durationMinutes: 45, price: 0, stopsCount: 2 }),
    tour({ id: "hour", durationMinutes: 60, price: 50, stopsCount: 4 }),
    tour({ id: "long", durationMinutes: 250, price: 120, stopsCount: 8, category: "Food" }),
  ];
  const f = (over) => applyTourFilters(items, { ...DEFAULT_TOUR_FILTERS, ...over }).map((t) => t.id);
  assert.deepEqual(f({ duration: ["under_1h"] }), ["short"]);
  assert.deepEqual(f({ duration: ["1_to_2h", "4h_plus"] }), ["hour", "long"]);
  assert.deepEqual(f({ price: ["free"] }), ["short"]);
  assert.deepEqual(f({ price: ["100_plus"] }), ["long"]);
  assert.deepEqual(f({ stops: ["1_to_3"] }), ["short"]);
  assert.deepEqual(f({ categories: ["food"] }), ["long"]);
  assert.deepEqual(f({ sort: "price_desc" }), ["long", "hour", "short"]);
  assert.deepEqual(f({ sort: "duration_asc" }), ["short", "hour", "long"]);
});

test("tour access filter splits unlocked and locked", () => {
  const items = [tour({ id: "a" }), tour({ id: "b" })];
  const unlockedIds = new Set(["a"]);
  assert.deepEqual(applyTourFilters(items, { ...DEFAULT_TOUR_FILTERS, access: "unlocked" }, { unlockedIds }).map((t) => t.id), ["a"]);
  assert.deepEqual(applyTourFilters(items, { ...DEFAULT_TOUR_FILTERS, access: "locked" }, { unlockedIds }).map((t) => t.id), ["b"]);
});

test("buildCategoryOptions dedupes case-insensitively with counts", () => {
  const opts = buildCategoryOptions([{ category: "Food" }, { category: "food" }, { category: "Art" }]);
  assert.deepEqual(opts, [
    { id: "art", label: "Art", count: 1 },
    { id: "food", label: "Food", count: 2 },
  ]);
});

test("filter URL state round-trips and drops unknown ids", () => {
  const params = writeTourFilters(new URLSearchParams("city=abc"), {
    ...DEFAULT_TOUR_FILTERS,
    duration: ["under_1h"],
    categories: ["food"],
    sort: "newest",
  });
  assert.equal(params.get("city"), "abc");
  const parsed = parseTourFilters(params);
  assert.deepEqual(parsed.duration, ["under_1h"]);
  assert.deepEqual(parsed.categories, ["food"]);
  assert.equal(parsed.sort, "newest");
  assert.equal(countTourFilters(parsed), 3);

  assert.deepEqual(parseTourFilters(new URLSearchParams("duration=bogus,1_to_2h")).duration, ["1_to_2h"]);
  assert.equal(parseStoryFilters(new URLSearchParams("radius=7")).radius, "all");
});
