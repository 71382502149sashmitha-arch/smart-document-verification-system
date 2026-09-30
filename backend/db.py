import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "database.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    return conn

def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        file_path TEXT,
        status TEXT
    )
    """)

    conn.commit()
    conn.close()
    print("Database & Tables ready ✅")
if __name__ == "__main__":
    create_tables()
    