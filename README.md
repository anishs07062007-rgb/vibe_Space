# Vibe Space

A mood-based outing planner. Tell Vibe Space how you feel, who you are with, and how much you can spend, and it suggests real nearby restaurants, cafes, tea spots, and adventure places with food ideas for each.

This is a college UI/UX project.

## Features

- **Mood-aware interface:** the page colors and the suggestions change with your mood (Sad, Happy, or No feelings).
- **Company and group size:** choose Alone, Friends, or Family, and enter the number of members.
- **Outing type:** Restaurant, Cafe, or Adventure.
- **Budget:** enter an amount per person or a total, and the two stay in sync with the group size. Low budgets (such as 100) still return tea spots, free parks, and walks.
- **Real places near you:** uses your browser location, or an area you type, to find places within 3 km.
- **Food suggestions:** typical dishes within budget for each place.
- **Login page:** name, gender, email id, and phone number.

## Tech stack

- Front end: HTML, CSS, and JavaScript (no framework)
- Back end: Node.js and Express
- Places data: [OpenStreetMap](https://www.openstreetmap.org) through the Overpass API
- Area search: Nominatim (OpenStreetMap geocoding)

No API key or billing account is needed.

## Project structure

```
vibe-space/
├── public/
│   └── index.html     # the website (UI and client logic)
├── server.js          # Express server and API routes
├── package.json
└── users.json         # created automatically on first login (do not upload)
```

## Getting started

### Requirements

- [Node.js](https://nodejs.org) (LTS version)
- A modern browser such as Chrome

### Install and run

```bash
# 1. Install the dependencies
npm install

# 2. Start the server
node server.js
```

Then open **http://localhost:3000** in your browser.

If you are setting up from scratch, run `npm init -y` and `npm install express` first.

## How it works

1. The user signs in with name, gender, email, and phone number.
2. The user picks a mood, company, group size, outing type, and budget.
3. The browser shares the user's location (or the user types an area).
4. The server asks OpenStreetMap for real places of the chosen type nearby.
5. The page filters them by estimated cost, sorts them by distance and mood, and shows food suggestions.

### API routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/places?lat=&lon=&type=&radius=` | GET | Real nearby places. `type` is `restaurant`, `cafe`, or `adventure`. |
| `/api/geocode?q=` | GET | Turns an area name into coordinates. |
| `/api/login` | POST | Saves or looks up a user (name, gender, email, phone). |

## Limitations

- **Prices and dishes are estimates.** OpenStreetMap does not store prices or menus, so costs are estimated from the type of place and dishes are typical for that cuisine. Check the real menu at the venue.
- **Data quality varies by area.** Some places have missing names, hours, or cuisine tags.
- **The login has no password.** It is a simple profile sign-in for a demo and is not secure authentication. Anyone who knows an email and phone number can sign in as that user.
- **The free map services can be busy.** If places fail to load, wait a minute and try again.

## Privacy

`users.json` stores real personal details. It is listed in `.gitignore` so it is not uploaded to GitHub. Never commit it.

## Future improvements

- Secure login with Firebase Authentication (password or OTP)
- Google Places API for ratings, photos, and real price levels
- A menu database for accurate food suggestions
- Saved favorites and past outings
- Map view of the suggested places

## Credits

- Place data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), available under the Open Database License.
- Built by [Your Name] as a college UI/UX project.
