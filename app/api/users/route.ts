import { NextRequest, NextResponse } from "next/server";
import { createUser, getUsers, ensureSheetTabs } from "@/lib/google-sheets";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    await ensureSheetTabs();
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, emoji } = await req.json();
    if (!name || !emoji) {
      return NextResponse.json({ error: "name and emoji required" }, { status: 400 });
    }
    await ensureSheetTabs();
    const user = { id: uuidv4(), name, emoji, createdAt: new Date().toISOString() };
    await createUser(user);
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
