"use client";

import { useState } from "react";
import Image from "next/image";

export default function GatePage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your work email.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = "Authorization failed.";
        try {
          const parsed = JSON.parse(text) as { error?: string };
          message = parsed.error || message;
        } catch {
          if (text.trim()) message = text;
        }
        throw new Error(message);
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authorization failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_16%_14%,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_85%_88%,rgba(52,211,153,0.16),transparent_40%),linear-gradient(180deg,#eef3ff,#f6f9ff_46%,#ecf8f7)] px-4 py-8 text-obsidian sm:px-6 lg:flex lg:items-center lg:justify-center">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.24),transparent_20%,transparent_80%,rgba(15,23,42,0.04))]" aria-hidden="true" />
      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-5 lg:grid-cols-[1.03fr_0.97fr]">
        <div className="flex h-full flex-col justify-center rounded-3xl border border-signal/15 bg-white/90 p-6 shadow-[0_22px_48px_rgba(37,99,235,0.12)] backdrop-blur sm:p-8 lg:p-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-signal/20 bg-signal/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-signal">
            Internal Access
          </div>
          <div className="mt-4 flex items-center gap-3">
            <img src="/scout-logo.png" alt="SCOUT" className="h-9 w-auto sm:h-10" />
            <div>
              <p className="text-2xl font-semibold sm:text-3xl">Access Gate</p>
            </div>
          </div>
          <p className="mt-4 max-w-[56ch] text-sm leading-6 text-obsidian/72">Add your OSF email.</p>
          <div className="mt-6 grid gap-3">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-obsidian/60">
              Work email
            </label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-obsidian/15 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-signal/35"
              placeholder="Email"
              type="email"
              autoComplete="email"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !loading) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
            />
            {error && <p className="text-sm text-rose">{error}</p>}
            <button
              onClick={handleSubmit}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-obsidian px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(11,18,32,0.22)] transition-transform hover:-translate-y-[1px]"
              disabled={loading}
            >
              {loading ? "Checking..." : "Continue to SCOUT"}
            </button>
            <p className="text-xs text-obsidian/55">Only approved OSF accounts can access this workspace.</p>
          </div>
        </div>

        <div className="relative flex h-full items-center justify-center overflow-hidden rounded-3xl border border-signal/15 bg-[linear-gradient(155deg,rgba(19,34,60,0.98),rgba(37,99,235,0.94))] p-6 shadow-[0_24px_54px_rgba(18,34,60,0.32)] sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-14 -bottom-20 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,rgba(110,255,249,0.24),transparent_46%)]" aria-hidden="true" />
          <div className="relative flex min-h-[360px] w-full max-w-[520px] items-center justify-center sm:min-h-[500px]">
            <Image
              src="/mascot/gate-mascot.png"
              alt="Scout mascot guiding sign in"
              fill
              priority
              sizes="(max-width: 1024px) 80vw, 42vw"
              className="object-contain drop-shadow-[0_24px_42px_rgba(26,208,255,0.42)]"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
