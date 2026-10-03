import os
import shutil
import sqlite3

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


# ==============================
# DATABASE CONNECTION
# ==============================

import tempfile

DB_FILE = os.path.join(os.path.dirname(__file__), "habits.db")

def get_db_path():
    if os.environ.get("VERCEL"):
        tmp_db = os.path.join(tempfile.gettempdir(), "habits.db")
        if not os.path.exists(tmp_db):
            if os.path.exists(DB_FILE):
                shutil.copyfile(DB_FILE, tmp_db)
        return tmp_db
    return DB_FILE

def get_db_connection():
    conn = sqlite3.connect(get_db_path())
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


create_table()


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
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)