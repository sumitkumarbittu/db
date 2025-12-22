from flask import Flask, render_template, request, session
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__, template_folder=".")
CORS(app, origins=["*"])

app.secret_key = "change-this-secret-key"

def get_db_connection():
    return psycopg2.connect(session.get("DATABASE_URL"))


MAX_HISTORY = 10

@app.route("/", methods=["GET", "POST"])
def index():

    if "query_history" not in session:
        session["query_history"] = []

    if request.method == "POST":

        if request.form.get("database_url"):
            session["DATABASE_URL"] = request.form.get("database_url")

        query = request.form.get("query")

        if query:
            try:
                conn = get_db_connection()
                cur = conn.cursor()
                cur.execute(query)

                history = session["query_history"]
                history.append(query)
                session["query_history"] = history[-10:]

                if query.strip().lower().startswith("select"):
                    rows = cur.fetchall()
                    columns = [desc[0] for desc in cur.description]
                    result = {
                        "columns": columns,
                        "rows": rows
                    }
                else:
                    conn.commit()
                    result = "Query executed successfully."

                cur.close()
                conn.close()

            except Exception as e:
                error = str(e)

    return render_template(
        "index.html",
        result=locals().get("result"),
        error=locals().get("error"),
        database_url=session.get("DATABASE_URL"),
        history=session.get("query_history", [])[::-1]
    )



if __name__ == "__main__":
    app.run(debug=True, port=5010)
