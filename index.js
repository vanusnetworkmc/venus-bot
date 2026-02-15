const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Porta dinamica per Railway
const PORT = process.env.PORT || 3000;

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

  if (!code) return res.status(400).send("No code provided");

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", REDIRECT_URI);

  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).send("Error during Discord OAuth");
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
