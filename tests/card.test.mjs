import assert from "node:assert/strict";
import test from "node:test";
import { fakeHass, loadCard } from "./harness.mjs";

const card = loadCard(new URL("../sentinel-chat-card.js", import.meta.url).pathname);

test("registers only the Sentinel element names", () => {
  for (const tag of ["sentinel-chat-card", "sentinel-chat-card-editor"]) {
    assert.ok(card.defined.has(tag), tag);
  }
  assert.ok(!card.defined.has("k93-ans-chat-card"));
});

test("uses the sentinel websocket prefix when available", async () => {
  card.evaluate("wsPrefix = null");
  const api = new (card.evaluate("SentinelApi"))();
  api.hass = fakeHass(() => ({ chatrooms: [] }));
  await api.call("chat/list_rooms");
  assert.deepEqual(api.hass.calls, ["sentinel/chat/list_rooms"]);
});

test("propagates non-fallback errors", async () => {
  card.evaluate("wsPrefix = null");
  const api = new (card.evaluate("SentinelApi"))();
  api.hass = fakeHass(() => {
    throw { code: "access_denied" };
  });
  await assert.rejects(api.call("chat/list_messages", { chatroom_id: "x" }), { code: "access_denied" });
  assert.deepEqual(api.hass.calls, ["sentinel/chat/list_messages"]);
});
