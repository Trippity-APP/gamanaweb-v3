import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildNarrators,
  journeyToTravelProfile,
  narratorLanguages,
  narratorVoiceCodes,
  travelProfileHomeCity,
  travelProfileToJourney,
} from "../lib/account/personalization.ts";

const journey = {
  homeLocation: "Bengaluru",
  corridor: "domestic",
  groupType: "A couple",
  travelingWithKidsOrElders: true,
  travelWindows: [{ from: "2026-11-02", to: "2026-11-09" }, {}],
  travelerProfiles: [
    { name: "Asha", interests: ["food"], subInterests: ["street food"], dietary: "veg", religiousObservance: "", allergies: "" },
  ],
  depth: "deep-dive",
  walkingTolerance: "Happy to walk all day",
  heatSensitive: false,
  additionalNotes: "Slow mornings",
  homeCity: "Jaipur",
  homeCityGeo: { country: "India", latitude: 26.91, longitude: 75.79 },
};

test("journeyToTravelProfile emits the backend TravelProfile enums and shapes", () => {
  const tp = journeyToTravelProfile(journey);
  assert.equal(tp.group_type, "couple");
  assert.equal(tp.walking_tolerance, "high");
  assert.equal(tp.corridor, "domestic");
  assert.equal(tp.depth, "deep-dive");
  assert.equal(tp.travelling_with_kids_or_elders, true);
  assert.deepEqual(tp.travel_windows, [{ from: "2026-11-02", to: "2026-11-09" }]);
  assert.deepEqual(tp.home_city, { name: "Jaipur", country: "India", latitude: 26.91, longitude: 75.79 });
  assert.equal(tp.travellers[0].sub_interests[0], "street food");
  assert.equal(tp.notes, "Slow mornings");
});

test("journeyToTravelProfile drops out-of-range coordinates and empty cities", () => {
  const bad = journeyToTravelProfile({ ...journey, homeCityGeo: { latitude: 120, longitude: 10 } });
  assert.deepEqual(bad.home_city, { name: "Jaipur" });
  assert.equal(journeyToTravelProfile({ ...journey, homeCity: "  " }).home_city, null);
  assert.equal(journeyToTravelProfile({ ...journey, groupType: "Unknown" }).group_type, null);
});

test("travelProfileToJourney round-trips labels and the home city", () => {
  const back = travelProfileToJourney(journeyToTravelProfile(journey));
  assert.equal(back.groupType, "A couple");
  assert.equal(back.walkingTolerance, "Happy to walk all day");
  assert.equal(back.homeCity, "Jaipur");
  assert.deepEqual(back.homeCityGeo, { country: "India", latitude: 26.91, longitude: 75.79 });
  assert.equal(back.travelerProfiles[0].name, "Asha");
  assert.equal(travelProfileToJourney({}), null);
  assert.equal(travelProfileToJourney(null), null);
});

test("travelProfileHomeCity accepts object and legacy string forms", () => {
  assert.equal(travelProfileHomeCity({ home_city: { name: " Goa " } }), "Goa");
  assert.equal(travelProfileHomeCity({ home_city: "Pune" }), "Pune");
  assert.equal(travelProfileHomeCity({ home_city: null }), null);
});

test("buildNarrators always sends language codes and keeps other voice preferences", () => {
  const live = {
    narrators: {
      languages: { labels: ["English"], codes: ["en"] },
      voice_preferences: { default: { gender: "female", voice_codes: ["old"] }, per_language: { hi: { voice_codes: ["h1"] } } },
    },
  };
  const out = buildNarrators(live, ["hi", "en"], "v2");
  assert.deepEqual(out.languages, { codes: ["hi", "en"] });
  assert.deepEqual(out.voice_preferences.default, { gender: "female", voice_codes: ["v2"] });
  assert.deepEqual(out.voice_preferences.per_language, { hi: { voice_codes: ["h1"] } });
  assert.deepEqual(buildNarrators(null, ["en"], null).voice_preferences, { default: { voice_codes: [] } });
  assert.deepEqual(narratorLanguages(live), ["en"]);
  assert.deepEqual(narratorVoiceCodes(live), ["old"]);
});
