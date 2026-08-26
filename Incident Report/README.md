# Incident Management — Module 9

Standalone backend module. Not dependent on any other module's code —
only shares the same Supabase database (same URL and key as your other modules).

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/incidents | Create a new incident |
| GET | /api/incidents | List incidents (filter by ?status= and ?severity=) |
| GET | /api/incidents/:id | Get one incident with full timeline + assignments |
| PATCH | /api/incidents/:id/status | Update status (Open/In Progress/Contained/Resolved/Closed) |
| PATCH | /api/incidents/:id/assign | Assign incident to an analyst |
| POST | /api/incidents/:id/notes | Add an analyst note to the timeline |
| GET | /health | Health check |

## Setup

1. Run `schema.sql` in your Supabase SQL Editor (same project as your other modules)
2. `npm install`
3. `copy .env.example .env` then fill in your Supabase URL + service role key
4. `npm start`

Runs on port 3004 by default (set in `.env`) so it doesn't collide with other modules
running locally at the same time (e.g. Email Investigation on 3000).
