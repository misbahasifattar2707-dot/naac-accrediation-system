import psycopg2
try:
    conn = psycopg2.connect("dbname='naac_db' user='postgres' host='127.0.0.1' password='root'")
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Connection failed: {e}")
