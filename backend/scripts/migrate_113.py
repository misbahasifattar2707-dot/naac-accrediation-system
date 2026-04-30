"""
Run this ONCE to migrate the records_113 table.
- Adds drive_link column (replaces document_path)
- Creates proof_links_113 table

Usage: python migrate_113.py
"""
import psycopg2

conn = psycopg2.connect(dbname="naac_db", user="postgres", password="root", host="localhost")
conn.autocommit = True
cur = conn.cursor()

# Add drive_link column if it doesn't exist
cur.execute("""
    ALTER TABLE records_113
    ADD COLUMN IF NOT EXISTS drive_link TEXT DEFAULT '';
""")
print("✓ drive_link column added to records_113.")

# Create proof_links_113 table
cur.execute("""
    CREATE TABLE IF NOT EXISTS proof_links_113 (
        id SERIAL PRIMARY KEY,
        link1 TEXT DEFAULT '',
        link2 TEXT DEFAULT ''
    );
""")
print("✓ proof_links_113 table created.")

cur.close()
conn.close()
print("\nDone! Restart Flask now.")
