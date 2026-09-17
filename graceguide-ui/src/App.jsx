import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  MessageCircle,
  BookOpen,
  Sun,
  Moon,
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Check,
  Copy,
  X,
  Settings,
  Pencil,
  Trash2,
  Heart,
  Cross,
  CalendarDays,
  RotateCcw,
} from "lucide-react";
import { useAuth, useDarkMode } from "./hooks/useApi";
import { useChats, conversationContext } from "./chatState";
import { useStore, selectCanAskQuestion } from "./store/useStore";
import { apiRequest } from "./client";
import { prayers } from "./data/prayers";
import { getTodayCelebration } from "./data/liturgical";
import AccountDialog from "./components/AccountDialog";
import "./styles.css";

const SUGGESTIONS = [
  {
    title: "Understand my faith",
    question: "Why do Catholics go to confession?",
    icon: BookOpen,
  },
  {
    title: "Find a little peace",
    question:
      "What does Scripture say about finding peace when I feel anxious?",
    icon: Heart,
  },
  {
    title: "Grow in prayer",
    question: "How can I begin a daily prayer habit?",
    icon: Cross,
  },
];
const MODE_NAMES = {
  both: "Scripture & Catechism",
  bible: "Scripture only",
  catechism: "Catechism only",
};
function BrandMark({ small = false }) {
  return (
    <span className={`brand-mark ${small ? "small" : ""}`} aria-hidden="true">
      <Cross size={small ? 18 : 28} strokeWidth={1.7} />
    </span>
  );
}
function Verse({ verse, error, onRetry, onReflect, full = false }) {
  return (
    <section
      className={`verse-card ${full ? "full-verse" : ""}`}
      aria-label="Verse of the day"
    >
      <div className="verse-label">
        <BookOpen size={15} />
        <span>VERSE OF THE DAY</span>
        <span className="verse-rule" />
      </div>
      {verse ? (
        <>
          <blockquote>“{verse.verse_text}”</blockquote>
          <div className="verse-bottom">
            <span>{verse.verse_reference}</span>
            <button className="text-button" onClick={onReflect}>
              Reflect on this <ArrowRight size={14} />
            </button>
          </div>
        </>
      ) : error ? (
        <p className="muted">
          The daily verse couldn’t load.{" "}
          <button className="text-button" onClick={onRetry}>
            Try again
          </button>
        </p>
      ) : (
        <p className="muted" role="status">
          Finding today’s verse…
        </p>
      )}
    </section>
  );
}
function Message({ message }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimer = useRef();
  useEffect(() => () => clearTimeout(copyTimer.current), []);
  if (message.role === "user")
    return (
      <div className="user-message">
        <span className="sr-only">You: </span>
        {message.content}
      </div>
    );
  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setCopyError(false);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }
  return (
    <article className="assistant-message">
      <div className="assistant-label">
        <BrandMark small />
        <span>GraceGuide</span>
      </div>
      <div className="answer-prose">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ children, href }) => (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
      {message.sources?.length > 0 && (
        <details className="sources">
          <summary>
            <BookOpen size={15} /> Sources <span>{message.sources.length}</span>
            <ChevronDown size={14} />
          </summary>
          <ol>
            {message.sources.map((source, i) => (
              <li key={i}>{source}</li>
            ))}
          </ol>
        </details>
      )}
      <button className="text-button copy-answer" onClick={copy}>
        {copied ? <Check size={14} /> : <Copy size={14} />}{" "}
        {copied ? "Copied" : "Copy answer"}
      </button>
      {copyError && (
        <span className="muted" role="status">
          {" "}
          Select the answer text to copy it.
        </span>
      )}
    </article>
  );
}
function PrayerLibrary() {
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const favorites = useStore((s) => s.favoritePrayers);
  const toggleFavorite = useStore((s) => s.toggleFavoritePrayer);
  const shown = prayers.filter(
    (p) =>
      (!favoritesOnly || favorites.includes(p.id)) &&
      `${p.title} ${p.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <section className="feature-page">
      <span className="eyebrow">MAKE A LITTLE ROOM</span>
      <h1>A moment for prayer.</h1>
      <p className="feature-intro">
        Familiar words to return to, wherever you are.
      </p>
      <div className="library-filters">
        <label className="search-field">
          <Search size={17} />
          <input
            aria-label="Search prayers"
            placeholder="Find a prayer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button
          className={`secondary-button ${favoritesOnly ? "selected" : ""}`}
          aria-pressed={favoritesOnly}
          onClick={() => setFavoritesOnly(!favoritesOnly)}
        >
          <Heart size={16} /> Favorites
        </button>
      </div>
      <div className="prayer-list">
        {shown.map((p) => (
          <div className="prayer-row" key={p.id}>
            <details>
              <summary>
                <span>
                  <small>{p.category}</small>
                  {p.title}
                </span>
                <ChevronDown size={17} />
              </summary>
              <div className="prayer-content">
                <p>{p.description}</p>
                <blockquote>{p.content}</blockquote>
              </div>
            </details>
            <button
              className="icon-button favorite-button"
              aria-label={`${favorites.includes(p.id) ? "Unfavorite" : "Favorite"} ${p.title}`}
              aria-pressed={favorites.includes(p.id)}
              onClick={() => toggleFavorite(p.id)}
            >
              <Heart
                size={18}
                fill={favorites.includes(p.id) ? "currentColor" : "none"}
              />
            </button>
          </div>
        ))}
      </div>
      {!shown.length && (
        <p className="muted">
          {favoritesOnly
            ? "No favorite prayers match yet. Tap the heart beside a prayer to save it."
            : "No prayers match your search."}
        </p>
      )}
    </section>
  );
}
export default function App() {
  const { user, signIn, signUp, signOut } = useAuth();
  const { darkMode, set: setDarkMode } = useDarkMode();
  const store = useStore();
  const {
    chats,
    activeId,
    storageError,
    start,
    select,
    create,
    append,
    rename,
    remove,
    removeUnanswered,
  } = useChats();
  const [page, setPage] = useState(() =>
    new URLSearchParams(window.location.search).get("view") === "daily"
      ? "daily"
      : "chat",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({});
  const [mode, setMode] = useState("both");
  const [pendingId, setPendingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [authOpen, setAuthOpen] = useState(false);
  const [verse, setVerse] = useState(null);
  const [verseError, setVerseError] = useState(false);
  const [showVerse, setShowVerse] = useState(
    () => localStorage.getItem("gg_showVerse") !== "false",
  );
  const [renameId, setRenameId] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const input = useRef(null);
  const sidebar = useRef(null);
  const menuToggle = useRef(null);
  const end = useRef(null);
  const inFlight = useRef(false);
  const activeChat = chats.find((c) => c.id === activeId);
  const messages = activeChat?.messages || [];
  const draftKey = activeId || "new";
  const draft = drafts[draftKey] || "";
  const lastMessage = messages.at(-1);
  const activeError =
    errors[activeId] ||
    (lastMessage?.role === "user" && pendingId !== activeId
      ? {
          question: lastMessage.content,
          mode: lastMessage.mode || "both",
          message:
            "This question has no answer yet. Try again or edit it below.",
        }
      : null);
  const celebration = getTodayCelebration();
  const setDraft = (value) => setDrafts((d) => ({ ...d, [draftKey]: value }));
  async function loadVerse() {
    setVerseError(false);
    try {
      setVerse(await apiRequest("/verse-of-the-day"));
    } catch {
      setVerseError(true);
    }
  }
  useEffect(() => {
    loadVerse();
    store.initializeUser();
  }, []);
  useEffect(() => {
    store.setUser(user ? { email: user.email } : null);
  }, [user]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);
  useEffect(() => {
    if (messages.length)
      end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, activeId, pendingId]);
  useEffect(() => {
    if (page === "chat" && window.matchMedia("(min-width: 761px)").matches)
      input.current?.focus();
  }, [activeId, page]);
  useEffect(() => {
    if (!input.current) return;
    input.current.style.height = "auto";
    input.current.style.height = `${Math.min(input.current.scrollHeight, 180)}px`;
  }, [draft, page]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const first = sidebar.current?.querySelector("button");
    first?.focus();
    function trap(e) {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        menuToggle.current?.focus();
      }
      if (e.key !== "Tab") return;
      const items = [
        ...sidebar.current.querySelectorAll("button, input"),
      ].filter((el) => !el.disabled && el.getClientRects().length);
      const first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [sidebarOpen]);
  function navigate(next) {
    setPage(next);
    setSidebarOpen(false);
  }
  function newChat() {
    start();
    navigate("chat");
  }
  function suggest(question) {
    start();
    setDrafts((d) => ({ ...d, new: question }));
    navigate("chat");
    requestAnimationFrame(() => input.current?.focus());
  }
  function reflect() {
    if (verse)
      suggest(
        `Help me reflect on ${verse.verse_reference}: “${verse.verse_text}”`,
      );
  }
  async function send(question = draft, retry = false) {
    question = question.trim();
    if (!question || inFlight.current || (activeError && !retry)) return;
    store.initializeUser();
    if (!selectCanAskQuestion(useStore.getState())) {
      setAuthOpen(true);
      return;
    }
    const chatId = activeId || create(question);
    const history = retry ? messages.slice(0, -1) : messages;
    if (!retry) append(chatId, { role: "user", content: question, mode });
    setDrafts((d) => ({ ...d, [draftKey]: "" }));
    setErrors((e) => ({ ...e, [chatId]: null }));
    inFlight.current = true;
    setPendingId(chatId);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 90000);
    try {
      const data = await apiRequest("/qa", {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          question,
          mode: retry ? activeError.mode : mode,
          history: conversationContext(history),
        }),
      });
      if (typeof data.answer !== "string" || !data.answer.trim())
        throw new Error("The answer was empty. Please try again.");
      append(chatId, {
        role: "assistant",
        content: data.answer,
        sources: data.sources || [],
      });
      useStore.getState().incrementDailyQuestions();
    } catch (err) {
      setErrors((e) => ({
        ...e,
        [chatId]: {
          question,
          mode,
          message:
            err.name === "AbortError"
              ? "This is taking longer than expected. Please try again."
              : err.message,
        },
      }));
    } finally {
      clearTimeout(timer);
      inFlight.current = false;
      setPendingId(null);
    }
  }
  const canAsk = selectCanAskQuestion(store);
  const composer = (
    <div className="composer-area">
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="sr-only" htmlFor="question">
          Your question
        </label>
        <textarea
          id="question"
          ref={input}
          value={draft}
          maxLength={4000}
          onChange={(e) => setDraft(e.target.value)}
          rows={2}
          placeholder={
            messages.length
              ? "Ask a follow-up…"
              : "Ask anything…"
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing &&
              window.matchMedia("(min-width: 761px)").matches
            ) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="composer-toolbar">
          <label className="source-select">
            <BookOpen size={15} />
            <span className="sr-only">Answer sources</span>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              {Object.entries(MODE_NAMES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown size={13} />
          </label>
          <button
            className="send-button"
            aria-label="Send question"
            disabled={!draft.trim() || !!pendingId || !!activeError}
            type="submit"
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </form>
      {!canAsk && (
        <p className="composer-note">
          <button className="text-button" onClick={() => setAuthOpen(true)}>
            You’ve reached today’s free limit. Sign in to keep asking.
          </button>
        </p>
      )}
    </div>
  );
  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );
  return (
    <div className={`app-shell ${desktopCollapsed ? "sidebar-collapsed" : ""}`}>
      {sidebarOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => {
            setSidebarOpen(false);
            menuToggle.current?.focus();
          }}
        />
      )}
      <aside
        ref={sidebar}
        className={`sidebar ${sidebarOpen ? "is-open" : ""}`}
        aria-label="Sidebar"
      >
        <div className="sidebar-brand">
          <button className="brand-link" onClick={newChat}>
            <BrandMark small />
            <span>
              GraceGuide<span className="brand-period">.</span>
            </span>
          </button>
          <button
            className="icon-button collapse-button"
            aria-label="Close sidebar"
            onClick={() => {
              setSidebarOpen(false);
              setDesktopCollapsed(true);
            }}
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <button className="new-chat" onClick={newChat}>
          <Plus size={18} />
          <span>New chat</span>
          <Pencil size={14} />
        </button>
        <nav className="feature-nav" aria-label="Features">
          <button
            className={page === "prayers" ? "active" : ""}
            onClick={() => navigate("prayers")}
          >
            <BookOpen size={17} /> Prayer library
          </button>
          <button
            className={page === "daily" ? "active" : ""}
            onClick={() => navigate("daily")}
          >
            <Sun size={17} /> Daily inspiration
          </button>
        </nav>
        <div className="chat-heading">
          <span>YOUR CONVERSATIONS</span>
          <MessageCircle size={13} />
        </div>
        {chats.length > 0 && (
          <label className="chat-search">
            <Search size={14} />
            <input
              aria-label="Search conversations"
              placeholder="Search chats"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        )}
        <div className="conversation-list">
          {sortedChats
            .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
            .map((c) => (
              <div
                key={c.id}
                className={`conversation ${activeId === c.id && page === "chat" ? "active" : ""}`}
              >
                {renameId === c.id ? (
                  <form
                    className="rename-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      rename(c.id, renameTitle);
                      setRenameId(null);
                    }}
                  >
                    <input
                      aria-label="Conversation name"
                      value={renameTitle}
                      autoFocus
                      onChange={(e) => setRenameTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") setRenameId(null);
                      }}
                    />
                    <button className="icon-button" aria-label="Save name">
                      <Check size={15} />
                    </button>
                  </form>
                ) : (
                  <>
                    <button
                      className="conversation-title"
                      onClick={() => {
                        select(c.id);
                        navigate("chat");
                      }}
                      title={c.title}
                    >
                      {pendingId === c.id && <span className="pending-dot" />}
                      {c.title}
                    </button>
                    <div className="chat-actions">
                      <button
                        className="icon-button"
                        aria-label={`Rename ${c.title}`}
                        onClick={() => {
                          setRenameId(c.id);
                          setRenameTitle(c.title);
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="icon-button"
                        disabled={pendingId === c.id}
                        aria-label={`Delete ${c.title}`}
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
                {deleteId === c.id && (
                  <div className="delete-confirm">
                    <span>Delete this chat?</span>
                    <button
                      onClick={() => {
                        remove(c.id);
                        setDeleteId(null);
                      }}
                    >
                      Delete
                    </button>
                    <button onClick={() => setDeleteId(null)}>Keep</button>
                  </div>
                )}
              </div>
            ))}
          {!chats.length && (
            <div className="empty-chats">
              <MessageCircle size={20} strokeWidth={1.3} />
              <p>A question is a beginning.</p>
              <span>Your conversations will appear here.</span>
            </div>
          )}
          {!!chats.length &&
            !chats.some((c) =>
              c.title.toLowerCase().includes(search.toLowerCase()),
            ) && <p className="muted search-empty">No conversations found.</p>}
        </div>
        <div className="sidebar-bottom">
          <p className="local-note">Chats are saved on this device.</p>
          <button
            className="account-button"
            onClick={() => (user ? navigate("settings") : setAuthOpen(true))}
          >
            <span className="avatar">
              {user ? user.email[0].toUpperCase() : "G"}
            </span>
            <span>
              <strong>
                {user ? user.email : "A space for your questions"}
              </strong>
              <small>
                {user ? "Free account" : "Sign in · Free unlimited questions"}
              </small>
            </span>
            <ArrowUpRight size={15} />
          </button>
          <button
            className="settings-button"
            onClick={() => navigate("settings")}
          >
            <Settings size={15} /> Settings & appearance
          </button>
        </div>
      </aside>
      <main className="main-panel" {...(sidebarOpen ? { inert: "" } : {})}>
        <header className="topbar">
          <div>
            <button
              ref={menuToggle}
              className="icon-button open-sidebar"
              aria-label="Open sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => {
                setSidebarOpen(window.matchMedia("(max-width: 760px)").matches);
                setDesktopCollapsed(false);
              }}
            >
              <PanelLeftOpen size={20} />
            </button>
            <span className="topbar-title">
              {page === "chat"
                ? activeChat?.title || "New chat"
                : page === "prayers"
                  ? "Prayer library"
                  : page === "daily"
                    ? "Daily inspiration"
                    : "Settings"}
            </span>
          </div>
          <button
            className="mobile-new icon-button"
            aria-label="New chat"
            onClick={newChat}
          >
            <Plus size={20} />
          </button>
        </header>
        {storageError && (
          <p className="error-banner" role="alert">
            Your browser couldn’t save this chat. Keep this tab open or copy
            your answers before leaving.
          </p>
        )}
        {page === "chat" && (
          <div className={`chat-page ${messages.length ? "has-messages" : ""}`}>
            {!messages.length ? (
              <div className="welcome">
                <div className="welcome-heading">
                  <h1>
                    Ask anything. Get answers rooted in <em>Scripture and the Catechism.</em>
                  </h1>
                </div>
                {composer}
                <div className="suggestions">
                  {SUGGESTIONS.map(({ title, question, icon: Icon }) => (
                    <button key={title} onClick={() => suggest(question)}>
                      <Icon size={18} strokeWidth={1.5} />
                      <span>{title}</span>
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
                </div>
                {showVerse && (
                  <Verse
                    verse={verse}
                    error={verseError}
                    onRetry={loadVerse}
                    onReflect={reflect}
                  />
                )}
              </div>
            ) : (
              <>
                <div className="messages-scroll">
                  <div className="messages">
                    {messages.map((m) => (
                      <Message key={m.id} message={m} />
                    ))}
                    {pendingId === activeId && (
                      <div className="thinking" role="status">
                        <BrandMark small />
                        <span>
                          Looking to Scripture and the Catechism
                          <span className="dots">…</span>
                        </span>
                      </div>
                    )}
                    {activeError && (
                      <div className="chat-error" role="alert">
                        <p>{activeError.message}</p>
                        <div>
                          <button
                            className="text-button"
                            onClick={() => send(activeError.question, true)}
                            disabled={!!pendingId}
                          >
                            <RotateCcw size={15} /> Try again
                          </button>
                          <button
                            className="text-button"
                            onClick={() => {
                              removeUnanswered(activeId);
                              setErrors((e) => ({ ...e, [activeId]: null }));
                              setDraft(activeError.question);
                            }}
                          >
                            Edit question
                          </button>
                        </div>
                      </div>
                    )}
                    <div ref={end} />
                  </div>
                </div>
                <div className="bottom-composer">
                  {composer}
                  <p className="ai-note">
                    GraceGuide can make mistakes. Check the sources; bring
                    personal spiritual questions to your priest.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        {page === "prayers" && (
          <div className="feature-scroll">
            <PrayerLibrary />
          </div>
        )}
        {page === "daily" && (
          <div className="feature-scroll">
            <section className="feature-page">
              <span className="eyebrow">PAUSE. REFLECT. BEGIN AGAIN.</span>
              <h1>A little light for today.</h1>
              <p className="feature-intro">
                {new Date().toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <Verse
                full
                verse={verse}
                error={verseError}
                onRetry={loadVerse}
                onReflect={reflect}
              />
              <section className="church-card">
                <CalendarDays size={23} />
                <div>
                  <span className="eyebrow">TODAY IN THE CHURCH</span>
                  <h2>{celebration.title}</h2>
                  <p>
                    {celebration.rank} · {celebration.season}
                  </p>
                  <small>A curated calendar; local observances may vary.</small>
                </div>
              </section>
            </section>
          </div>
        )}
        {page === "settings" && (
          <div className="feature-scroll">
            <section className="feature-page settings-page">
              <span className="eyebrow">MAKE YOURSELF AT HOME</span>
              <h1>Your preferences.</h1>
              <div className="setting-row">
                <div>
                  <h3>Appearance</h3>
                  <p>A comfortable space to read and reflect.</p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => setDarkMode(!darkMode)}
                >
                  {darkMode ? <Moon size={17} /> : <Sun size={17} />}{" "}
                  {darkMode ? "Dark" : "Light"}
                </button>
              </div>
              <div className="setting-row">
                <div>
                  <h3>Verse on the welcome screen</h3>
                  <p>Keep a little inspiration beside your questions.</p>
                </div>
                <button
                  className={`toggle ${showVerse ? "on" : ""}`}
                  role="switch"
                  aria-checked={showVerse}
                  aria-label="Show daily verse"
                  onClick={() => {
                    setShowVerse(!showVerse);
                    localStorage.setItem("gg_showVerse", String(!showVerse));
                  }}
                >
                  <span />
                </button>
              </div>
              <div className="setting-row">
                <div>
                  <h3>{user ? user.email : "Your account"}</h3>
                  <p>
                    {user
                      ? "Free, unlimited questions."
                      : "Sign in for free, unlimited questions."}
                  </p>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => (user ? signOut() : setAuthOpen(true))}
                >
                  {user ? "Sign out" : "Sign in"}
                </button>
              </div>
              <div className="privacy-note">
                <h3>Your conversations, on this device.</h3>
                <p>
                  Chats are stored in this browser, including on shared devices.
                  Signing in does not sync them across devices. When you ask a
                  question, recent messages in that chat are sent to
                  GraceGuide’s AI service to understand follow-ups. You can
                  delete individual chats from the sidebar.
                </p>
              </div>
            </section>
          </div>
        )}
      </main>
      {authOpen && (
        <AccountDialog
          onClose={() => setAuthOpen(false)}
          signIn={signIn}
          signUp={signUp}
        />
      )}
    </div>
  );
}
