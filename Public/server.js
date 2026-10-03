const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const UA = "VibeSpaceCollegeProject/1.0 (student project)";
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];
const FILTERS = {
  restaurant: ['["amenity"~"restaurant|fast_food|food_court"]'],
  cafe: ['["amenity"="cafe"]', '["shop"="tea"]', '["cuisine"~"tea|coffee_shop"]'],
  adventure: [
    '["leisure"~"park|garden|nature_reserve|sports_centre|water_park|miniature_golf"]',
    '["tourism"~"attraction|viewpoint|zoo|theme_park"]',
    '["natural"~"beach|peak"]',
  ],
};

app.get("/api/places", async (req, res) => {
  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const type = req.query.type;
  const radius = Math.min(parseInt(req.query.radius) || 3000, 10000);
  if (!isFinite(lat) || !isFinite(lon) || !FILTERS[type]) {
    return res.status(400).json({ error: "Need lat, lon and a valid type." });
  }
  const parts = FILTERS[type]
    .map((f) => `nwr${f}(around:${radius},${lat},${lon});`)
    .join("");
  const query = `[out:json][timeout:20];(${parts});out center 80;`;

  for (const url of MIRRORS) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "User-Agent": UA, "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(25000),
      });
      if (!r.ok) continue;
      const j = await r.json();
      const seen = new Set();
      const places = [];
      for (const el of j.elements || []) {
        const t = el.tags || {};
        const plat = el.lat ?? (el.center && el.center.lat);
        const plon = el.lon ?? (el.center && el.center.lon);
        if (!t.name || plat == null || plon == null || seen.has(t.name)) continue;
        seen.add(t.name);
        places.push({
          name: t.name,
          lat: plat,
          lon: plon,
          kind: t.amenity || t.shop || t.leisure || t.tourism || t.natural || "place",
          cuisine: t.cuisine || "",
          hours: t.opening_hours || "",
        });
      }
      return res.json({ places });
    } catch (e) {
      /* try the next mirror */
    }
  }
  res.status(502).json({ error: "The places service is busy. Try again in a minute." });
});

app.get("/api/geocode", async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.status(400).json({ error: "Type an area or city first." });
  try {
    const r = await fetch(
      "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" + encodeURIComponent(q),
      { headers: { "User-Agent": UA } }
    );
    const j = await r.json();
    if (!j.length) return res.status(404).json({ error: "Area not found. Try a nearby city name." });
    res.json({ lat: parseFloat(j[0].lat), lon: parseFloat(j[0].lon), name: j[0].display_name });
  } catch (e) {
    res.status(502).json({ error: "Could not search for that area right now." });
  }
});

const USERS = path.join(__dirname, "users.json");
const GENDERS = ["Female", "Male", "Non-binary", "Prefer not to say"];
function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS, "utf8")); } catch (e) { return []; }
}

app.post("/api/login", (req, res) => {
  const b = req.body || {};
  const name = String(b.name || "").trim().slice(0, 60);
  const gender = String(b.gender || "");
  const email = String(b.email || "").trim().toLowerCase().slice(0, 100);
  const phone = String(b.phone || "").replace(/[\s-]/g, "");
  if (name.length < 2) return res.status(400).json({ error: "Enter your name." });
  if (!GENDERS.includes(gender)) return res.status(400).json({ error: "Choose a gender option." });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Enter a valid email id." });
  if (!/^\+?\d{10,13}$/.test(phone)) return res.status(400).json({ error: "Enter a valid phone number (10 digits)." });

  const users = readUsers();
  let u = users.find((x) => x.email === email);
  if (u && u.phone !== phone) {
    return res.status(401).json({ error: "This email is already registered with a different phone number." });
  }
  if (u) {
    u.name = name;
    u.gender = gender;
    u.lastLogin = new Date().toISOString();
  } else {
    u = { name, gender, email, phone, created: new Date().toISOString() };
    users.push(u);
  }
  fs.writeFileSync(USERS, JSON.stringify(users, null, 2));
  res.json({ user: { name: u.name, gender: u.gender, email: u.email, phone: u.phone } });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Vibe Space running at http://localhost:" + PORT));