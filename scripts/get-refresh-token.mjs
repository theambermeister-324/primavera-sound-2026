/**
 * Run once to get your Google OAuth refresh token.
 *
 * Usage:
 *   1. Fill in CLIENT_ID and CLIENT_SECRET below (from Google Cloud Console)
 *   2. node scripts/get-refresh-token.mjs
 *   3. Open the URL it prints, authorize with theambermeister@gmail.com
 *   4. Paste the code from the redirect URL when prompted
 *   5. Copy the refresh_token into your .env.local
 */

import { createServer } from "http";
import { google } from "googleapis";
import { createInterface } from "readline";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000/oauth2callback";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET as env vars before running:\n" +
    "  GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/get-refresh-token.mjs"
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/calendar",
  ],
});

console.log("\n👉 Open this URL in your browser (use theambermeister@gmail.com):\n");
console.log(authUrl);
console.log("\nAfter authorizing, you'll be redirected to localhost:3000/oauth2callback?code=...");
console.log("Copy just the 'code' parameter value and paste it below.\n");

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question("Paste the code here: ", async (code) => {
  rl.close();
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log("\n✅ Success! Add these to your .env.local:\n");
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GOOGLE_SHEET_ID=<paste your sheet ID here>`);
    console.log(`GOOGLE_CALENDAR_ID=theambermeister@gmail.com`);
  } catch (err) {
    console.error("\n❌ Failed to exchange code:", err.message);
    console.error("Make sure you pasted the full code and it hasn't expired (they expire quickly).");
  }
});
