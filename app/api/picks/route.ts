import { NextRequest, NextResponse } from "next/server";
import { addPick, removePick, getPicks, ensureSheetTabs } from "@/lib/google-sheets";

export async function GET() {
  try {
    await ensureSheetTabs();
    const picks = await getPicks();
    return NextResponse.json(picks);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch picks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, artistId } = await req.json();
    if (!userId || !artistId) {
      return NextResponse.json({ error: "userId and artistId required" }, { status: 400 });
    }
    await ensureSheetTabs();
    await addPick({ userId, artistId, createdAt: new Date().toISOString() });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add pick" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, artistId } = await req.json();
    await ensureSheetTabs();
    await removePick(userId, artistId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to remove pick" }, { status: 500 });
  }
}
