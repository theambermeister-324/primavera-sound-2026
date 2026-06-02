"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import schedule from "@/data/schedule.json";

type User = { id: string; name: string; emoji: string };
type Pick = { userId: string; artistId: string };

const DAY_LABELS: Record<string, string> = {
  "2026-06-04": "Thu Jun 4",
  "2026-06-05": "Fri Jun 5",
  "2026-06-06": "Sat Jun 6",
  "2026-06-07": "Sun Jun 7",
};

export default function GroupPage() {
  const myId = Cookies.get("ps26_user_id");
  const [users, setUsers] = useState<User[]>([]);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [filter, setFilter] = useState<"group" | string>("group");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/users").then((r) => r.json()), fetch("/api/picks").then((r) => r.json())])
      .then(([u, p]) => { setUsers(u); setPicks(p); setLoading(false); });
  }, []);

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const scoredSets = schedule.map((set) => {
    const whoWants = picks.filter((p) => p.artistId === set.id).map((p) => userMap[p.userId]).filter(Boolean);
    return { ...set, whoWants };
  });

  const visible = scoredSets
    .filter((s) => {
      if (filter === "group") return s.whoWants.length >= 2;
      return s.whoWants.some((u) => u.id === filter);
    })
    .sort((a, b) => {
      if (filter === "group") return b.whoWants.length - a.whoWants.length || a.day.localeCompare(b.day) || a.startTime.localeCompare(b.startTime);
      return a.day.localeCompare(b.day) || a.startTime.localeCompare(b.startTime);
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Group View</h1>
        <p className="text-white/50 text-sm">Sets ranked by overlap · filter by person</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("group")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === "group" ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"}`}
        >
          👥 Group
        </button>
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => setFilter(u.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === u.id ? "bg-pink-500" : "bg-white/10 hover:bg-white/20"} ${u.id === myId ? "ring-1 ring-white/30" : ""}`}
          >
            {u.emoji} {u.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-white/40 text-sm">
          {filter === "group"
            ? "No sets have 2+ people picking them yet."
            : "This person hasn't picked anything yet."}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((set) => (
            <div
              key={set.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-sm">{set.artist}</span>
                <span className="text-xs text-white/40">
                  {DAY_LABELS[set.day]} · {set.startTime}–{set.endTime} · {set.stage}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {set.whoWants.map((u) => (
                  <span key={u.id} title={u.name} className="text-lg">{u.emoji}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
