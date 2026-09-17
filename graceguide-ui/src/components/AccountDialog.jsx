import React, { useEffect, useRef, useState } from "react";
import { X, ArrowRight } from "lucide-react";

export default function AccountDialog({ onClose, signIn, signUp }) {
  const dialog = useRef(null);
  const [mode, setMode] = useState("signin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    dialog.current.showModal();
  }, []);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      await (mode === "signin" ? signIn : signUp)(
        data.get("email").trim().toLowerCase(),
        data.get("password"),
      );
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      ref={dialog}
      className="account-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === dialog.current) onClose();
      }}
    >
      <div className="dialog-content">
        <button
          className="icon-button dialog-close"
          aria-label="Close sign in"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <span className="eyebrow">YOUR SPACE FOR FAITH</span>
        <h2>
          {mode === "signin" ? "Welcome back." : "A little closer, every day."}
        </h2>
        <p>
          Sign in for free, unlimited questions. Your chats stay in this
          browser.
        </p>
        <form onSubmit={submit}>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              minLength={mode === "signup" ? 6 : undefined}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              required
            />
          </label>
          {error && (
            <p className="error-note" role="alert">
              {error}
            </p>
          )}
          <button className="primary-button" disabled={busy}>
            {busy
              ? "One moment…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
            <ArrowRight size={17} />
          </button>
        </form>
        <button
          className="text-button auth-switch"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError("");
          }}
        >
          {mode === "signin"
            ? "New here? Create a free account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </dialog>
  );
}
