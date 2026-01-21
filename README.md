# PostgreSQL Query Executor

A lightweight web UI + Flask API for executing ad-hoc SQL queries against a PostgreSQL database.

## Quickstart

```bash
pip install -r requirements.txt
python app.py
```

- API: `http://localhost:5010`
- UI: open `index.html` in a browser (or serve it as static files)

## Project layout

- `app.py`
  - Flask API (`/save-db`, `/execute`, `/status`, `/health`)
  - Executes queries using `psycopg2`
- `index.html`
  - UI shell
- `script.js`
  - Frontend logic: API selection, query execution, table rendering, exports
- `style.css`
  - UI styles
- `track.js`
  - Frontend tracking/extra UI behavior
- `requirements.txt`
  - Python dependencies

## What’s in this repo

- **Backend**: `app.py` (Flask + `psycopg2`)
- **Frontend**: `index.html`, `style.css`, `script.js` (static)

## Features

- **Database connection** via a PostgreSQL connection string
- **Query execution** with JSON results
- **Tabular rendering** for `SELECT` queries
- **Last 10 queries** stored in the browser (frontend)
- **Binary (bytea) support** returned as base64-encoded payloads

## Requirements

- Python 3.10+ recommended
- Access to a PostgreSQL database

## Local development

### Install

```bash
pip install -r requirements.txt
```

### Run the backend

```bash
python app.py
```

The Flask dev server listens on `http://localhost:5010`.

### Run the frontend

You have two options:

- Open `index.html` directly in a browser
- Serve the repo folder via a static file server

The UI makes HTTP calls to the backend endpoints and displays results.

## Install

```bash
pip install -r requirements.txt
```

## Run locally (development)

Start the API:

```bash
python app.py
```

The Flask dev server listens on `http://localhost:5010`.

Open the UI:

- Open `index.html` directly in your browser, or
- Serve it via any static file server of your choice.

## Run in production

Use `gunicorn` (already listed in `requirements.txt`):

```bash
gunicorn -b 0.0.0.0:${PORT:-5010} app:app
```

Notes:

- If your platform provides `PORT` (e.g., Render/Heroku-style), the command above will bind correctly.
- The backend enables CORS for all origins by default.

## Configuration

This project currently does **not** read a database URL from environment variables.

- The backend stores the last value passed to `POST /save-db` in an in-memory global variable (`DATABASE_URL`).
- Restarting the backend clears the connection setting.

### Frontend API base URLs (`script.js`)

The frontend contains a list of hardcoded API base URLs in `script.js` (`API_BASES`) and allows selecting among them in the UI.

For a single deployment you typically want one of these approaches:

- **Edit `API_BASES`** to include only your deployed API
- **Point all entries** to the same API

If you host the UI and API on the same origin, you can also simplify the UI to use a relative base (not implemented currently).

## Architecture / data flow

- The browser UI calls `POST /save-db` with a PostgreSQL connection string.
- The backend stores the connection string in memory (`DATABASE_URL`).
- The UI calls `POST /execute` with an SQL query string.
- The backend:
  - Opens a new PostgreSQL connection per request
  - Executes the query
  - Returns either:
    - A column + row payload for `SELECT`
    - A success string for non-`SELECT` statements
- For `bytea` values, the backend serializes them as base64 objects.

## Operational notes

### Concurrency

In production with multiple workers/instances:

- The in-memory `DATABASE_URL` is **not shared** between workers/instances.
- Each worker will require `POST /save-db` again after restart.

If you need a consistent, production-safe setup, you’ll typically replace this with an environment-based configuration and/or an authenticated per-user session store.

### Logging

The current backend returns error messages in the response body but does not add structured logging. For production, add request logging and avoid returning internal errors verbatim.

### Health checks

`GET /health` returns `{"status":"ok"}` and is suitable for basic liveness checks.

## API

Base URL: your running backend (e.g., `http://localhost:5010`).

### Common headers

- `Content-Type: application/json`

### Error format

Errors are returned as:

```json
{"error":"..."}
```

### `GET /health`

Health check.

Response:

```json
{"status":"ok"}
```

### `GET /status`

Connection status.

Response:

```json
{"connected":true}
```

### `POST /save-db`

Save a PostgreSQL connection string in memory.

Request:

```json
{"database_url":"postgresql://user:password@host:5432/dbname"}
```

Response:

```json
{"status":"saved"}
```

Status codes:

- `200` on success

### `POST /execute`

Execute an SQL statement.

Request:

```json
{"query":"SELECT * FROM users;"}
```

Responses:

- For `SELECT`, returns `{"result":{"columns":[...],"rows":[...]}}`
- For non-`SELECT`, returns `{"result":"Query executed successfully"}`
- On error, returns `{"error":"..."}` with a `4xx/5xx` status

Status codes:

- `200` on success
- `400` if no database has been saved (`Database not connected`)
- `500` on execution errors

#### Example: curl

Save DB:

```bash
curl -sS -X POST http://localhost:5010/save-db \
  -H 'Content-Type: application/json' \
  -d '{"database_url":"postgresql://user:password@localhost:5432/db"}'
```

Execute query:

```bash
curl -sS -X POST http://localhost:5010/execute \
  -H 'Content-Type: application/json' \
  -d '{"query":"SELECT 1 as ok;"}'
```

#### `bytea` return format

If a cell contains PostgreSQL `bytea`, it is returned as an object:

```json
{"__type":"bytea","base64":"..."}
```

## Security considerations (production)

This tool is intentionally minimal; **do not expose it publicly** without additional controls.

- **No authentication/authorization**: anyone who can reach the API can run arbitrary SQL.
- **CORS is wide open** (`origins=["*"]`). Restrict origins for real deployments.
- **Connection string handling**: sent over HTTP requests; always use HTTPS in production.
- **No isolation / sandboxing**: queries run with the privileges of the database user.

### Hardening checklist

- Restrict CORS to your UI domain
- Add authentication (at minimum: single-user password / token)
- Add authorization (read-only vs admin roles)
- Use a least-privileged database user (separate from migrations/admin)
- Add rate limiting and request size limits
- Add allowlist/denylist rules for SQL statements if appropriate
- Do not return raw exception strings in production responses
- Run behind HTTPS

## Deployment notes

If deploying the API to a PaaS (e.g., Render), a typical start command is:

```bash
gunicorn -b 0.0.0.0:${PORT} app:app
```

Then host the frontend (`index.html`, `style.css`, `script.js`) as static files (same domain preferred) and ensure the UI points to your API base URL.

### Production checklist

- Set a proper start command (e.g., `gunicorn -b 0.0.0.0:${PORT} app:app`)
- Ensure database networking is allowed (VPC / firewall / allowlist)
- Prefer same-origin UI+API hosting to reduce CORS complexity
- Add authentication before exposing beyond a private network

## Troubleshooting

- **`Database not connected`**
  - Call `POST /save-db` first (or use the UI “Save Connection”).
- **CORS errors in the browser**
  - In production you should restrict allowed origins and serve UI + API from the same origin when possible.
- **`psycopg2.OperationalError`**
  - Verify the connection string, network access, and that the database allows inbound connections from your host.

## Limitations

- Connection configuration is stored **in memory** per backend process.
- No authentication/authorization.
- No migrations or schema management.
- `SELECT` detection is a simple string prefix check (`query.strip().lower().startswith("select")`).

## FAQ

### Can I set the DB URL via an environment variable?

Not currently. The backend only accepts the DB URL via `POST /save-db`.

### Why does it “forget” the DB connection?

The backend stores it in a global variable and does not persist it. Restarts (or multiple workers) will require saving again.

## License

See [LICENSE](LICENSE).

