import { google } from "googleapis";

function getAuth() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

function getSheetsClient() {
  const auth = getAuth();
  auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export type User = { id: string; name: string; emoji: string; createdAt: string };
export type Pick = { userId: string; artistId: string; createdAt: string };

export async function getUsers(): Promise<User[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "users!A2:D",
  });
  return (res.data.values ?? []).map(([id, name, emoji, createdAt]) => ({
    id, name, emoji, createdAt,
  }));
}

export async function createUser(user: User): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "users!A:D",
    valueInputOption: "RAW",
    requestBody: { values: [[user.id, user.name, user.emoji, user.createdAt]] },
  });
}

export async function getPicks(): Promise<Pick[]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "picks!A2:C",
  });
  return (res.data.values ?? []).map(([userId, artistId, createdAt]) => ({
    userId, artistId, createdAt,
  }));
}

export async function addPick(pick: Pick): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "picks!A:C",
    valueInputOption: "RAW",
    requestBody: { values: [[pick.userId, pick.artistId, pick.createdAt]] },
  });
}

export async function removePick(userId: string, artistId: string): Promise<void> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "picks!A2:C",
  });
  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex(([u, a]) => u === userId && a === artistId);
  if (rowIndex === -1) return;

  // Clear the matched row (row 2 = index 0, so +2 for header)
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SHEET_ID,
    range: `picks!A${rowIndex + 2}:C${rowIndex + 2}`,
  });
}

export async function ensureSheetTabs(): Promise<void> {
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const titles = (meta.data.sheets ?? []).map((s) => s.properties?.title);

  const toAdd: string[] = [];
  if (!titles.includes("users")) toAdd.push("users");
  if (!titles.includes("picks")) toAdd.push("picks");
  if (toAdd.length === 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: toAdd.map((title) => ({
        addSheet: { properties: { title } },
      })),
    },
  });

  // Add headers
  for (const title of toAdd) {
    const headers = title === "users"
      ? [["id", "name", "emoji", "createdAt"]]
      : [["userId", "artistId", "createdAt"]];
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${title}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: headers },
    });
  }
}
