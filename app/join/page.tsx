"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const EMOJIS = ["🎸", "🎹", "🥁", "🎤", "🎺", "🎻", "🪗", "🎷", "🦋", "🌈", "🔥", "⚡"];

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎸");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const existingId = Cookies.get("ps26_user_id");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), emoji }),
      });
      if (!res.ok) throw new Error("Failed to create user");
      const user = await res.json();
      Cookies.set("ps26_user_id", user.id, { expires: 365 });
      Cookies.set("ps26_user_name", user.name, { expires: 365 });
      Cookies.set("ps26_user_emoji", user.emoji, { expires: 365 });
      router.push("/picks");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (existingId) {
    const existingName = Cookies.get("ps26_user_name");
    const existingEmoji = Cookies.get("ps26_user_emoji");
    return (
      <div className="flex flex-col gap-6 max-w-md">
        <h1 className="text-2xl font-bold">You&apos;re already in</h1>
        <p className="text-white/70">
          Logged in as {existingEmoji} <strong>{existingName}</strong>
        </p>
        <div className="flex gap-3">
          <a
            href="/picks"
            className="px-5 py-2 bg-pink-500 hover:bg-pink-400 rounded-lg font-semibold transition-colors"
          >
            Go to My Picks →
          </a>
          <button
            onClick={() => {
              Cookies.remove("ps26_user_id");
              Cookies.remove("ps26_user_name");
              Cookies.remove("ps26_user_emoji");
              window.location.reload();
            }}
            className="px-5 py-2 border border-white/20 hover:border-white/40 rounded-lg text-sm transition-colors"
          >
            Switch user
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-md">
      <div>
        <h1 className="text-2xl font-bold mb-1">Join the group</h1>
        <p className="text-white/60 text-sm">
          Pick a name and an emoji — your crew will see these next to your picks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Amber"
            className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-pink-400 outline-none text-white placeholder-white/30 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-white/70">Pick an emoji</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setEmoji(e)}
                className={`text-2xl w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                  emoji === e
                    ? "bg-pink-500 border-2 border-pink-300"
                    : "bg-white/10 border border-white/10 hover:bg-white/20"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="px-6 py-3 bg-pink-500 hover:bg-pink-400 disabled:opacity-40 rounded-lg font-semibold transition-colors"
        >
          {loading ? "Joining..." : "Join →"}
        </button>
      </form>
    </div>
  );
}
