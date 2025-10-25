# HTV_MindQuest (MindQuest)

Mini learning games for kids — a small ASP.NET Core backend with a simple static frontend under `wwwroot`.

This repository is a lightweight, local-friendly app used to play short cognitive games (math, memory, patterns, Simon, etc.). It's intentionally simple so you can run it locally without any external services.

## Quick start (run locally)

1. From the project folder (the folder that contains `HTV_MindQuest.csproj`):

```bash
cd HTV_MindQuest/HTV_MindQuest/HTV_MindQuest
dotnet build
dotnet run --urls http://localhost:5000
```

2. Open the app in your browser:

http://localhost:5000

## Default credentials / auth behavior

- A static dev account exists in `Data/StaticAuthStore.cs`:
	- username: `kid1`
	- password: `password`

- The app supports registration/login into the SQLite DB, but for quick local use the app will fall back to the static in-file credentials and also allow anonymous play (the static user will be used for scoring if unauthenticated).

- If you want to reset the local DB (SQLite file `brainquest.db` in the project folder), stop the app and delete the file:

```bash
rm brainquest.db
dotnet run --urls http://localhost:5000
```

On startup the app will create and seed the DB if missing.

## Games included

- Memory Match — flip emoji cards and find pairs (frontend-only)
- Pattern Logic — find the next number in a sequence (frontend-only)
- Timed Math Sprint — answer as many math questions as you can in the time limit (frontend-only)
- Simon Says — reproduce an increasing color sequence (frontend-only)
- Existing simple games (math, word scramble, guess number)

Scoring is kept client-side in the current session (displayed in the UI). The backend accepts game results at `POST /api/games/result` (GameResultDto: `{ gameId, score }`) if you later choose to persist results.

## API endpoints (useful)

- POST `/api/auth/login` — { username, password } → returns `{ token }` (JWT)
- POST `/api/auth/register` — registration is currently disabled in the default dev build (see `AuthController`)
- POST `/api/games/result` — store a game result (expects `{ gameId, score }`)
- GET `/api/progress/me` — returns progress for the current user (requires auth; the UI falls back to the static user if anonymous)

JWT secret is in `appsettings.json` under `Jwt:Key`. For local/dev use the project includes a default key.

## Where to change things

- Frontend games and UI: `wwwroot/js/app.js` and `wwwroot/index.html`.
- Styling: `wwwroot/css/styles.css`.
- Static dev credentials: `Data/StaticAuthStore.cs`.
- DB seeding: `Data/SeedData.cs`.
- Backend controllers: `Controllers/` (AuthController, GamesController, ProgressController).

## Accessibility & mobile

- The UI includes keyboard handlers and focus styles; memory cards and game buttons are accessible via Tab+Enter/Space.
- The CSS is responsive and adjusts touch targets for mobile.

## Development notes

- This repo intentionally keeps some dev shortcuts (static credentials, anonymous fallbacks) for local testing. Remove or secure these before publishing.
- If you want scores to persist, I can wire the frontend to auto-post wins to `/api/games/result` and add a local or server-side high-score list.

## License

Use as you like; if you publish or distribute, consider adding a proper LICENSE file (MIT recommended for permissive use).

---

If you'd like, I can also:
- Add a local high-score board (stored in localStorage) and display per-game top scores.
- Auto-post results to the server when a round finishes.
- Add simple audio feedback for success/failure.

Tell me which of those you'd like next and I'll implement it.
