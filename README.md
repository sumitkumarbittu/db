# PostgreSQL Query Executor

A lightweight, browser-based SQL client that provides a simple yet powerful interface for executing PostgreSQL queries through a Flask API backend. This tool is designed for developers, database administrators, and data analysts who need quick, ad-hoc database access without the overhead of installing full-fledged database management software.

## 🌟 Core Features

### 1. Database Connectivity & Management
- **Universal PostgreSQL Support**: Connect to any PostgreSQL database using standard connection strings
- **In-Memory Session Management**: Secure storage of connection credentials in server memory (volatile storage)
- **Connection Status Monitoring**: Real-time connection status indicators and automatic reconnection
- **Multi-Environment Support**: Easily switch between different database environments

### 2. Advanced SQL Query Interface
- **Rich SQL Editor**: Built-in editor with syntax highlighting for better query composition
- **Query History**: Automatic tracking of recent queries with quick recall functionality
- **Binary Data Handling**: Full support for PostgreSQL `bytea` data types with base64 encoding/decoding
- **Query Execution Feedback**: Immediate feedback on query execution status and results

### 3. Results Visualization & Export
- **Tabular Results Display**: Clean, sortable tables for query results
- **Responsive Design**: Adapts to different screen sizes for on-the-go database access
- **Data Export**: Export query results in multiple formats (CSV, JSON)
- **Binary Data Preview**: Special handling for binary data with visual indicators

### 4. User Experience Enhancements
- **Interactive UI**: Intuitive card-based interface with clear visual hierarchy
- **Real-time Clock Widget**: Built-in customizable clock with timezone support (GMT/IST)
- **Keyboard Shortcuts**: Efficient workflow with keyboard navigation
- **Responsive Layout**: Works seamlessly across desktop and tablet devices

### 5. Security & Performance
- **No Data Persistence**: Queries and results are never stored on the server
- **Client-Side Storage**: Query history maintained in browser's local storage
- **Lightweight Architecture**: Minimal server footprint for optimal performance
- **CORS Support**: Configurable CORS policies for secure cross-origin requests

## 🛠 Technical Implementation

### Backend (Flask/Python)
- **RESTful API**: Clean API endpoints for database operations
- **Connection Pooling**: Efficient database connection management
- **Error Handling**: Comprehensive error handling and validation
- **Health Monitoring**: Built-in health check endpoints

### Frontend (Vanilla JavaScript)
- **Modern UI Components**: Custom-built UI elements without external dependencies
- **Responsive Design**: CSS Grid and Flexbox for adaptive layouts
- **Local Storage**: Persistent storage for user preferences and query history
- **Drag & Drop**: Interactive elements for enhanced usability

## 🔄 Workflow

1. **Connection Setup**:
   - Enter PostgreSQL connection string
   - Save connection settings
   - Verify connection status

2. **Query Execution**:
   - Compose SQL queries in the editor
   - Execute and view results in real-time
   - Access query history for quick recall

3. **Data Management**:
   - View and sort results
   - Export data in multiple formats
   - Handle binary data with built-in preview

## 🏗 Project Structure

- `app.py`: Flask backend server with API endpoints
- `index.html`: Main application interface
- `style.css`: Custom styling and responsive design
- `script.js`: Frontend application logic
- `track.js`: Additional UI/UX enhancements
- `requirements.txt`: Python dependencies

## 🚀 Getting Started

1. Install dependencies: `pip install -r requirements.txt`
2. Start the Flask server: `python app.py`
3. Open `index.html` in a modern web browser
4. Enter your PostgreSQL connection string and start querying

## 💡 Ideal Use Cases

- **Development & Debugging**: Quick data inspection and validation
- **Database Administration**: Run administrative queries and maintenance tasks
- **Data Analysis**: Execute analytical queries and export results
- **Educational Purposes**: Learn and practice SQL in a safe environment
- **Production Monitoring**: Lightweight monitoring of production databases

## 🔒 Security Note

While this tool is designed with security in mind, it's recommended to:
- Deploy behind authentication/VPN for production use
- Restrict access to trusted networks
- Use read-only database users when possible
- Regularly update dependencies for security patches

## 🚀 Key Features

### 🔌 Seamless Database Connectivity
- **Flexible Connection Management**: Connect to any PostgreSQL database using standard connection strings
- **In-Memory Session Storage**: Connection credentials are stored securely in server memory (not persisted to disk)
- **Multiple Environment Support**: Easily switch between different database environments with pre-configured API endpoints

### 💻 Intuitive Query Interface
- **Rich SQL Editor**: Syntax highlighting and basic query formatting for better readability
- **Query History**: Maintains a log of your recent queries with quick-access functionality
- **Tabular Results**: Clean, sortable table display for `SELECT` query results
- **Binary Data Support**: Seamless handling of PostgreSQL `bytea` data types with base64 encoding

### ⚡ Performance & Usability
- **Lightweight & Fast**: Minimal overhead for quick query execution and response times
- **Responsive Design**: Works smoothly on both desktop and tablet devices
- **No Installation Required**: Access your database directly from any modern web browser

### 🔒 Security Considerations
- **No Persistence**: Queries and results are not stored on the server
- **Client-Side History**: Query history is maintained in the browser's local storage
- **Configurable Access**: Deploy behind your organization's authentication/VPN for secure internal use

## 📋 Overview

This tool serves as a lightweight alternative to traditional database clients, perfect for:
- Quick data inspection and validation
- Database debugging and troubleshooting
- Running one-off administrative queries
- Data exploration and analysis
- Database monitoring and health checks

Built with simplicity and efficiency in mind, it's particularly useful in development, staging, and production environments where you need quick database access without the overhead of a full database management suite.

## Use cases

- **Quick debugging**
  - Verify data during development, QA, or incident investigation.
- **Operational checks**
  - Run read-only queries for health metrics, counts, and sanity checks.
- **Internal admin tool (private network)**
  - Lightweight query UI for a team when deployed behind authentication/VPN.
- **Learning / demos**
  - Experiment with SQL queries and result rendering.

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

