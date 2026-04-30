"""
Run this ONCE to create the proof_links_11 table.
Usage: python migrate_proof_11.py
"""
import psycopg2

conn = psycopg2.connect(dbname="naac_db", user="postgres", password="root", host="localhost")
conn.autocommit = True
cur = conn.cursor()

cur.execute("""
    CREATE TABLE IF NOT EXISTS proof_links_11 (
        id SERIAL PRIMARY KEY,
        link1 TEXT DEFAULT '',
        link2 TEXT DEFAULT ''
    );
""")
print("✓ proof_links_11 table created (or already exists).")
cur.close()
conn.close()
