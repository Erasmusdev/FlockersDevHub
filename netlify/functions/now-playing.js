import express from "express";
import fetch from "node-fetch";
import open from "open";

const clientId = "YOUR_CLIENT_ID";       // from Spotify dashboard
const clientSecret = "YOUR_CLIENT_SECRET"; // from Spotify dashboard
const redirectUri = "http://127.0.0.1:8888/callback";
const port = 8888;

const app = express();

app.get("/login", (req, res) => {
  const scope = "user-read-currently-playing";
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("scope", scope);
  authUrl.searchParams.append("redirect_uri", redirectUri);

  res.redirect(authUrl.toString());
});

app.get("/callback", async (req, res) => {
  const code = req.query.code || null;

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await tokenResponse.json();

  console.log("Access Token:", data.access_token);
  console.log("Refresh Token:", data.refresh_token);

  res.send("✅ Check your terminal! Copy the refresh token into Netlify.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  open(`http://localhost:${port}/login`);
});
