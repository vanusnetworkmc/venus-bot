const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Porta al login Discord
app.get("/auth/discord", (req, res) => {
  const url =
    `https://discord.com/api/oauth2/authorize` +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=identify`;

  res.redirect(url);
});

// Callback dopo il login
app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);

  const tokenRes = await fetch(
    "https://discord.com/api/oauth2/token",
    {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }
  );

  const tokenData = await tokenRes.json();

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const user = await userRes.json();

  res.redirect(`${FRONTEND_URL}?user=${encodeURIComponent(JSON.stringify(user))}`);
});

app.listen(3000, () => console.log("Server running"));
