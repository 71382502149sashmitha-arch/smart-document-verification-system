from db import get_connection

conn = get_connection()
cursor = conn.cursor()

cursor.execute(
    "INSERT INTO admin (username, password) VALUES (?, ?)",
    ("admin", "1234")
)

conn.commit()
conn.close()

print("Admin added ✅")