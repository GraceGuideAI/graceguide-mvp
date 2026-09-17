import { create } from "zustand";

export const CHAT_KEY = "gg_conversations_v1";
const id = () => crypto.randomUUID();
function readChats() {
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_KEY));
    if (Array.isArray(saved))
      return saved.filter((c) => c.id && Array.isArray(c.messages));
    // Keep previously saved single-question history available in the sidebar.
    const legacy = JSON.parse(localStorage.getItem("gg_history") || "[]");
    return legacy.map((item) => ({
      id: `legacy-${item.id}`,
      title: item.question,
      updatedAt: item.timestamp,
      messages: [
        { id: id(), role: "user", content: item.question },
        {
          id: id(),
          role: "assistant",
          content:
            typeof item.answer === "string"
              ? item.answer
              : item.answer?.answer || "",
          sources: item.answer?.sources || [],
        },
      ],
    }));
  } catch {
    return [];
  }
}

export const useChats = create((set, get) => ({
  chats: readChats(),
  activeId: null,
  storageError: false,
  save: (chats) => {
    let storageError = false;
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(chats));
    } catch {
      storageError = true;
    }
    set({ chats, storageError });
  },
  start: () => set({ activeId: null }),
  select: (activeId) => set({ activeId }),
  create: (title) => {
    const chatId = id();
    get().save([
      {
        id: chatId,
        title: title.slice(0, 70),
        updatedAt: new Date().toISOString(),
        messages: [],
      },
      ...get().chats,
    ]);
    set({ activeId: chatId });
    return chatId;
  },
  append: (chatId, message) =>
    get().save(
      get().chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              updatedAt: new Date().toISOString(),
              messages: [...c.messages, { id: id(), ...message }],
            }
          : c,
      ),
    ),
  removeUnanswered: (chatId) =>
    get().save(
      get().chats.map((c) =>
        c.id === chatId && c.messages.at(-1)?.role === "user"
          ? { ...c, messages: c.messages.slice(0, -1) }
          : c,
      ),
    ),
  rename: (chatId, title) => {
    if (title.trim())
      get().save(
        get().chats.map((c) =>
          c.id === chatId ? { ...c, title: title.trim().slice(0, 70) } : c,
        ),
      );
  },
  remove: (chatId) => {
    get().save(get().chats.filter((c) => c.id !== chatId));
    if (get().activeId === chatId) set({ activeId: null });
  },
}));

export function conversationContext(messages) {
  // Only completed exchanges go to the server. Browser history remains local.
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));
}
