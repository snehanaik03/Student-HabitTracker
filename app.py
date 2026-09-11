from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)


# ==============================
# DATABASE CONNECTION
# ==============================

def get_db_connection():
    conn = sqlite3.connect("habits.db")
    conn.row_factory = sqlite3.Row
    return conn


# ==============================
# CREATE DATABASE TABLE
# ==============================

def create_table():

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            target INTEGER NOT NULL,
            completed INTEGER DEFAULT 0
        )
    """)

    conn.commit()
    conn.close()


# ==============================
# HOME PAGE
# ==============================

@app.route("/")
def home():
    return render_template("index.html")


# ==============================
# GET HABITS
# ==============================

@app.route("/api/habits", methods=["GET"])
def get_habits():

    conn = get_db_connection()

    habits = conn.execute(
        "SELECT * FROM habits ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([
        dict(habit)
        for habit in habits
    ])


# ==============================
# ADD HABIT
# ==============================

@app.route("/api/habits", methods=["POST"])
def add_habit():

    data = request.get_json()

    name = data.get("name")
    category = data.get("category")
    target = data.get("target")

    if not name:
        return jsonify({
            "error": "Habit name is required"
        }), 400

    conn = get_db_connection()

    conn.execute(
        """
        INSERT INTO habits
        (name, category, target, completed)
        VALUES (?, ?, ?, 0)
        """,
        (name, category, target)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit added successfully"
    })


# ==============================
# COMPLETE / UNCOMPLETE HABIT
# ==============================

@app.route(
    "/api/habits/<int:habit_id>/complete",
    methods=["PUT"]
)
def complete_habit(habit_id):

    conn = get_db_connection()

    habit = conn.execute(
        "SELECT completed FROM habits WHERE id = ?",
        (habit_id,)
    ).fetchone()

    if habit is None:

        conn.close()

        return jsonify({
            "error": "Habit not found"
        }), 404

    new_status = 0 if habit["completed"] else 1

    conn.execute(
        """
        UPDATE habits
        SET completed = ?
        WHERE id = ?
        """,
        (new_status, habit_id)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit updated"
    })


# ==============================
# DELETE HABIT
# ==============================

@app.route(
    "/api/habits/<int:habit_id>",
    methods=["DELETE"]
)
def delete_habit(habit_id):

    conn = get_db_connection()

    conn.execute(
        "DELETE FROM habits WHERE id = ?",
        (habit_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit deleted"
    })


# ==============================
# EDIT HABIT
# ==============================

@app.route(
    "/api/habits/<int:habit_id>",
    methods=["PUT"]
)
def edit_habit(habit_id):

    data = request.get_json()

    name = data.get("name")
    category = data.get("category")
    target = data.get("target")

    conn = get_db_connection()

    conn.execute(
        """
        UPDATE habits
        SET name = ?, category = ?, target = ?
        WHERE id = ?
        """,
        (name, category, target, habit_id)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Habit updated successfully"
    })


# ==============================
# START FLASK
# ==============================

if __name__ == "__main__":

    create_table()

    app.run(debug=True)