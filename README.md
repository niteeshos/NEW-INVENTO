# Andaman&Co.

A full-stack tours and travels platform for Andaman & Nicobar.

## Features

- High-end animated modern UI with premium typography
- Dynamic hotel, activity, car and gallery sections from backend APIs
- Tour booking form saved to database with automated WhatsApp inquiry launch
- Car booking form saved to database with automated WhatsApp inquiry launch
- Hidden admin command portal route for adding hotels, activities, cars and gallery stories
- SQLite database for persistent data

## Stack

- Frontend: HTML, modern CSS animations, vanilla JavaScript
- Backend: Python `http.server` with custom API handlers
- Database: SQLite (`data/andaman.db`)

## Run

```bash
python3 app.py
```

Open:
- Website: `http://localhost:3000`
- Admin (hidden route): `http://localhost:3000/andaman-command-portal-9x7`

## Admin access

Default key sent in header via admin portal input:

`andaman-admin-2026`

Override with env vars:

```bash
PORT=3000
ADMIN_KEY=your-secret-key
ADMIN_PATH=/your-private-admin-route
python3 app.py
```
