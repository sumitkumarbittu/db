# PostgreSQL Query Executor

A web-based SQL query interface for PostgreSQL databases with a modern, responsive UI.

## Features

- **Database Connection**: Connect to any PostgreSQL database using connection strings
- **Query Execution**: Execute SQL queries with real-time results
- **Result Display**: Formatted table display for SELECT queries
- **Query History**: Track last 10 executed queries
- **Error Handling**: Clear error messages for failed queries
- **Responsive Design**: Mobile-friendly interface with gradient styling

## Tech Stack

- **Backend**: Flask (Python)
- **Database**: PostgreSQL (via psycopg2)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **CORS**: Flask-CORS for cross-origin requests
- **Deployment**: Render (keep-alive functionality)

## API Endpoints

### `POST /save-db`
Save database connection string
```json
{
  "database_url": "postgresql://user:password@host:5432/dbname"
}
```

### `POST /execute`
Execute SQL query
```json
{
  "query": "SELECT * FROM users;"
}
```

### `GET /status`
Check database connection status
```json
{
  "connected": true
}
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python app.py
```

The server will start on `http://localhost:5010`

## Usage

1. Open `index.html` in a web browser
2. Enter your PostgreSQL connection string
3. Click "Save Connection" to connect
4. Enter SQL queries in the textarea
5. Click "Execute Query" to run queries
6. View results in the formatted display
7. Check query history for recent executions

## Security Notes

- Database credentials are stored in memory only
- No persistent storage of connection strings
- CORS enabled for all origins (configure for production)
- Consider implementing authentication for production use

## Dependencies

- Flask: Web framework
- psycopg2-binary: PostgreSQL adapter
- flask-cors: Cross-origin resource sharing
- Flask-Session: Session management
- gunicorn: WSGI HTTP server

## Development

The application consists of:
- `app.py`: Flask backend with API endpoints
- `index.html`: Frontend interface with styling and JavaScript
- `requirements.txt`: Python dependencies

## License

This project is open source and available under the [LICENSE](LICENSE) file.

