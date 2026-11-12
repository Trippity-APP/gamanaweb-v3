import { test } from "node:test";
import assert from "node:assert/strict";
import { refreshCatalog } from "../lib/marketplace-api.ts";

const walk = (id, title = id) => ({ id, title, contentKind: "walk" });
const story = (id, title = id) => ({ id, title, contentKind: "story" });

test("replaces the build-time snapshot with the live catalog", () => {
  const snapshot = [walk("a", "Old title"), walk("gone"), story("s1")];
  const fresh = [walk("a", "New title"), walk("new"), story("s1")];
  assert.deepEqual(refreshCatalog(snapshot, fresh, snapshot), fresh);
});

test("keeps a content kind the live fetch returned nothing for", () => {
  const snapshot = [walk("a"), story("s1")];
  const fresh = [story("s1", "Edited")];
  assert.deepEqual(refreshCatalog(snapshot, fresh, snapshot), [story("s1", "Edited"), walk("a")]);
});

test("keeps search and city matches merged in after load, unless asked not to", () => {
  const snapshot = [walk("a")];
  const current = [walk("a"), walk("from-search")];
  const fresh = [walk("a", "Edited")];
  assert.deepEqual(refreshCatalog(current, fresh, snapshot), [walk("a", "Edited"), walk("from-search")]);
  assert.deepEqual(refreshCatalog(current, fresh, snapshot, false), [walk("a", "Edited")]);
});

test("leaves the list alone when the live fetch is empty", () => {
  const snapshot = [walk("a")];
  assert.equal(refreshCatalog(snapshot, [], snapshot), snapshot);
});
