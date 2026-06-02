import { NextRequest, NextResponse } from "next/server";
import { getPicks, getUsers } from "@/lib/google-sheets";
import { pushEventsToCalendar } from "@/lib/google-calendar";
import schedule from "@/data/schedule.json";

export async function POST(req: NextRequest) {
  try {
    const { mode, userId, minOverlap = 2 } = await req.json();
    const [allPicks, users] = await Promise.all([getPicks(), getUsers()]);

    let artistIds: string[];

    if (mode === "personal" && userId) {
      artistIds = allPicks.filter((p) => p.userId === userId).map((p) => p.artistId);
    } else {
      // Group mode: artists picked by >= minOverlap people
      const counts: Record<string, Set<string>> = {};
      for (const pick of allPicks) {
        if (!counts[pick.artistId]) counts[pick.artistId] = new Set();
        counts[pick.artistId].add(pick.userId);
      }
      artistIds = Object.entries(counts)
        .filter(([, userSet]) => userSet.size >= minOverlap)
        .map(([id]) => id);
    }

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const events = artistIds.flatMap((artistId) => {
      const set = schedule.find((s) => s.id === artistId);
      if (!set) return [];
      const attendees = allPicks
        .filter((p) => p.artistId === artistId)
        .map((p) => userMap[p.userId]?.name)
        .filter(Boolean) as string[];
      return [{ artistId: set.id, ...set, attendees }];
    });

    const count = await pushEventsToCalendar(events);
    return NextResponse.json({ pushed: count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Calendar push failed" }, { status: 500 });
  }
}
