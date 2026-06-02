"use client";
import { useState } from "react";
import Cookies from "js-cookie";

export default function ExportPage() {
  const userId = Cookies.get("ps26_user_id");
  const userName = Cookies.get("ps26_user_name");
  const userEmoji = Cookies.get("ps26_user_emoji");

  const [mode, setMode] = useState<"group" | "personal">("group");
  const [minOverlap, setMinOverlap] = useState(2);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [pushed, setPushed] = useState(0);

  async function handleExport() {
    setStatus("loading");
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, userId, minOverlap }),
      });
      if (!res.ok) throw new Error("Export failed");
      const data = await res.json();
      setPushed(data.pushed);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <div>
        <h1 className="text-2xl font-bold mb-1">Export to Google Calendar</h1>
        <p className="text-white/60 text-sm">
          Pushes events to <span className="text-white/80">theambermeister@gmail.com</span>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">Export mode</label>
          <div className="flex gap-2">
            <button
              onClick={() => setMode("group")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "group" ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"}`}
            >
              👥 Group calendar
            </button>
            <button
              onClick={() => setMode("personal")}
              disabled={!userId}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "personal" ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"} disabled:opacity-40`}
            >
              {userEmoji ?? "👤"} {userName ? `${userName}'s picks` : "My picks"}
            </button>
          </div>
        </div>

        {mode === "group" && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/70">
              Minimum overlap: <span className="text-white">{minOverlap} people</span>
            </label>
            <input
              type="range"
              min={2}
              max={6}
              value={minOverlap}
              onChange={(e) => setMinOverlap(Number(e.target.value))}
              className="accent-pink-500"
            />
            <p className="text-xs text-white/40">Only include sets that at least {minOverlap} people picked</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60 leading-relaxed">
          {mode === "group"
            ? `Will push sets with ${minOverlap}+ people overlapping. Each event lists who's going in the description.`
            : `Will push only ${userName ?? "your"} personal picks to the calendar.`}
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={status === "loading"}
        className="px-6 py-3 bg-pink-500 hover:bg-pink-400 disabled:opacity-40 rounded-lg font-semibold transition-colors"
      >
        {status === "loading" ? "Pushing to Google Calendar…" : "Push to Google Calendar →"}
      </button>

      {status === "done" && (
        <p className="text-green-400 text-sm">
          ✓ {pushed} event{pushed !== 1 ? "s" : ""} added to your calendar.
        </p>
      )}
      {status === "error" && (
        <p className="text-red-400 text-sm">
          Something went wrong. Check that your Google credentials are configured.
        </p>
      )}
    </div>
  );
}
