import { test } from "node:test";
import assert from "node:assert/strict";
import { cityLabel, readLastCity, writeLastCity } from "../lib/home/last-city.ts";

test("cityLabel keeps the city part of an autocomplete label", () => {
  assert.equal(cityLabel("Jaipur, Rajasthan, India"), "Jaipur");
  assert.equal(cityLabel("  Delhi "), "Delhi");
});

test("storage helpers are safe without a window", () => {
  assert.equal(readLastCity(), null);
  assert.doesNotThrow(() => writeLastCity("Jaipur"));
});
