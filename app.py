from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app, origins=["*"])

DATABASE_URL = None
QUERY_HISTORY = []

MAX_HISTORY = 10

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)


@app.route("/save-db", methods=["POST"])
def save_db():
    global DATABASE_URL
    data = request.json
    DATABASE_URL = data.get("database_url")
    return jsonify({"status": "saved"})


@app.route("/execute", methods=["POST"])
def execute_query():
    global QUERY_HISTORY

    if not DATABASE_URL:
        return jsonify({"error": "Database not connected"}), 400

    query = request.json.get("query")

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(query)

        QUERY_HISTORY.append(query)
        QUERY_HISTORY = QUERY_HISTORY[-MAX_HISTORY:]

        if query.strip().lower().startswith("select"):
            rows = cur.fetchall()
            columns = [d[0] for d in cur.description]
            result = {"columns": columns, "rows": rows}
        else:
            conn.commit()
            result = "Query executed successfully"

        cur.close()
        conn.close()

        return jsonify({
            "result": result,
            "history": QUERY_HISTORY[::-1]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/status", methods=["GET"])
def status():
    return jsonify({
        "connected": DATABASE_URL is not None
    })

if __name__ == "__main__":
    app.run(port=5010)
