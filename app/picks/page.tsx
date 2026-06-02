"use client";
import { useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import schedule from "@/data/schedule.json";

type SetItem = (typeof schedule)[number];
type Pick = { userId: string; artistId: string };

const DAYS = ["2026-06-04", "2026-06-05", "2026-06-06", "2026-06-07"];
const DAY_LABELS: Record<string, string> = {
  "2026-06-04": "Thu Jun 4",
  "2026-06-05": "Fri Jun 5",
  "2026-06-06": "Sat Jun 6",
  "2026-06-07": "Sun Jun 7",
};

export default function PicksPage() {
  const userId = Cookies.get("ps26_user_id");
  const userName = Cookies.get("ps26_user_name");
  const userEmoji = Cookies.get("ps26_user_emoji");

  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [allPicks, setAllPicks] = useState<Pick[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchPicks = useCallback(async () => {
    const res = await fetch("/api/picks");
    const data: Pick[] = await res.json();
    setAllPicks(data);
    if (userId) {
      setPicks(new Set(data.filter((p) => p.userId === userId).map((p) => p.artistId)));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchPicks(); }, [fetchPicks]);

  async function toggle(artistId: string) {
    if (!userId) return;
    const picked = picks.has(artistId);
    setPicks((prev) => {
      const next = new Set(prev);
      picked ? next.delete(artistId) : next.add(artistId);
      return next;
    });
    await fetch("/api/picks", {
      method: picked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, artistId }),
    });
    fetchPicks();
  }

  const filtered = schedule.filter((s) => {
    const matchesSearch = s.artist.toLowerCase().includes(search.toLowerCase()) ||
      s.stage.toLowerCase().includes(search.toLowerCase());
    const matchesDay = selectedDay === "all" || s.day === selectedDay;
    return matchesSearch && matchesDay;
  });

  if (!userId) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">My Picks</h1>
        <p className="text-white/60">
          You need to <a href="/join" className="text-pink-400 underline">join the group</a> first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Picks</h1>
          <p className="text-white/50 text-sm">{userEmoji} {userName} · {picks.size} selected</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artists or stages…"
          className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-pink-400 outline-none text-white placeholder-white/30 text-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedDay("all")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedDay === "all" ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"}`}
          >
            All
          </button>
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${selectedDay === d ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"}`}
            >
              {DAY_LABELS[d].split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <p className="text-white/40 text-sm">No sets match your search.</p>
          )}
          {filtered.sort((a, b) => a.day.localeCompare(b.day) || a.startTime.localeCompare(b.startTime)).map((set) => {
            const picked = picks.has(set.id);
            const groupCount = allPicks.filter((p) => p.artistId === set.id).length;
            return (
              <button
                key={set.id}
                onClick={() => toggle(set.id)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors text-left ${
                  picked
                    ? "border-pink-400 bg-pink-500/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-sm">{set.artist}</span>
                  <span className="text-xs text-white/40">
                    {DAY_LABELS[set.day]} · {set.startTime}–{set.endTime} · {set.stage}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {groupCount > 0 && (
                    <span className="text-xs text-white/40">{groupCount} picking</span>
                  )}
                  <span className={`text-lg ${picked ? "opacity-100" : "opacity-20"}`}>
                    {picked ? "♥" : "♡"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
