import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: (key) => values.delete(key),
};
const { useChats, CHAT_KEY, conversationContext } =
  await import("../src/chatState.js");
beforeEach(() => {
  values.clear();
  useChats.setState({ chats: [], activeId: null, storageError: false });
});

test("a delayed answer stays with its conversation after switching chats", () => {
  const first = useChats.getState().create("First question");
  useChats
    .getState()
    .append(first, { role: "user", content: "First question" });
  const second = useChats.getState().create("Second question");
  useChats
    .getState()
    .append(first, {
      role: "assistant",
      content: "First answer",
      sources: ["Reference"],
    });
  assert.equal(useChats.getState().activeId, second);
  assert.equal(
    useChats.getState().chats.find((c) => c.id === first).messages.length,
    2,
  );
  assert.equal(
    useChats.getState().chats.find((c) => c.id === second).messages.length,
    0,
  );
});

test("messages and sources survive reload while startup opens a blank composer", async () => {
  const id = useChats.getState().create("Saved chat");
  useChats
    .getState()
    .append(id, {
      role: "assistant",
      content: "Saved answer",
      sources: ["CCC 1"],
    });
  const restored = await import("../src/chatState.js?reload");
  assert.equal(
    restored.useChats.getState().chats[0].messages[0].sources[0],
    "CCC 1",
  );
  assert.equal(restored.useChats.getState().activeId, null);
  assert.equal(JSON.parse(values.get(CHAT_KEY)).length, 1);
});

test("failed storage retains the in-memory conversation and exposes a warning", () => {
  const write = localStorage.setItem;
  localStorage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  try {
    const id = useChats.getState().create("Retained");
    assert.equal(useChats.getState().chats[0].id, id);
    assert.equal(useChats.getState().storageError, true);
  } finally {
    localStorage.setItem = write;
  }
});

test("editing an unanswered question removes only that unfinished turn", () => {
  const id = useChats.getState().create("Chat");
  for (const role of ["user", "assistant", "user"])
    useChats.getState().append(id, { role, content: role });
  useChats.getState().removeUnanswered(id);
  useChats.getState().removeUnanswered(id);
  assert.deepEqual(
    useChats.getState().chats[0].messages.map((m) => m.role),
    ["user", "assistant"],
  );
});

test("context is bounded and excludes unrelated message roles", () => {
  const messages = Array.from({ length: 14 }, (_, n) => ({
    role: n % 2 ? "assistant" : "user",
    content: "x".repeat(6500),
  }));
  messages.push({ role: "error", content: "internal failure" });
  const context = conversationContext(messages);
  assert.equal(context.length, 10);
  assert.ok(context.every((m) => m.content.length === 6000));
  assert.ok(context.every((m) => m.role !== "error"));
});

test("legacy single-question history migrates without altering the original", async () => {
  values.set(
    "gg_history",
    JSON.stringify([
      {
        id: 123,
        question: "Old question",
        answer: { answer: "Old answer", sources: ["John 1:1"] },
        timestamp: "2025-01-01",
      },
    ]),
  );
  const legacy = await import("../src/chatState.js?legacy");
  assert.equal(
    legacy.useChats.getState().chats[0].messages[1].content,
    "Old answer",
  );
  assert.ok(values.has("gg_history"));
});

test("renaming and deleting a conversation update persisted history", () => {
  const id = useChats.getState().create("Original");
  useChats.getState().rename(id, "Updated");
  assert.equal(JSON.parse(values.get(CHAT_KEY))[0].title, "Updated");
  useChats.getState().remove(id);
  assert.equal(useChats.getState().activeId, null);
  assert.deepEqual(JSON.parse(values.get(CHAT_KEY)), []);
});
