import psycopg2

def migrate_pure():
    try:
        conn = psycopg2.connect("dbname='naac_db' user='postgres' host='127.0.0.1' password='root'")
        cursor = conn.cursor()
        
        # 1. Create new tables if they don't exist
        print("Creating new lookup and evidence tables...")
        tables_to_create = [
            "CREATE TABLE IF NOT EXISTS department_lookup (id SERIAL PRIMARY KEY, value VARCHAR(255) UNIQUE NOT NULL);",
            "CREATE TABLE IF NOT EXISTS designation_lookup (id SERIAL PRIMARY KEY, value VARCHAR(100) UNIQUE NOT NULL);",
            "CREATE TABLE IF NOT EXISTS highest_degree_lookup (id SERIAL PRIMARY KEY, value VARCHAR(100) UNIQUE NOT NULL);",
            "CREATE TABLE IF NOT EXISTS appointment_type_lookup (id SERIAL PRIMARY KEY, value VARCHAR(100) UNIQUE NOT NULL);",
            "CREATE TABLE IF NOT EXISTS funding_agency_lookup (id SERIAL PRIMARY KEY, value VARCHAR(255) UNIQUE NOT NULL);",
            "CREATE TABLE IF NOT EXISTS level_lookup (id SERIAL PRIMARY KEY, value VARCHAR(100) UNIQUE NOT NULL);",
            "CREATE TABLE IF NOT EXISTS team_individual_lookup (id SERIAL PRIMARY KEY, value VARCHAR(50) UNIQUE NOT NULL);",
            "CREATE TABLE IF NOT EXISTS egovernance_area_lookup (id SERIAL PRIMARY KEY, value VARCHAR(100) UNIQUE NOT NULL);",
            "CREATE TABLE IF NOT EXISTS evidence (id SERIAL PRIMARY KEY, filename VARCHAR(255) NOT NULL, file_path TEXT NOT NULL, criterion_type VARCHAR(50), record_id INTEGER, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, created_by_id INTEGER, updated_by_id INTEGER);"
        ]
        
        for stmt in tables_to_create:
            cursor.execute(stmt)
            print(f"  Executed: {stmt[:50]}...")

        # 2. Add audit columns to all tables
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [row[0] for row in cursor.fetchall()]
        
        print(f"Found {len(tables)} tables. Adding audit columns...")
        for table in tables:
            if table == 'alembic_version' or table == 'evidence': continue
            
            print(f"Processing table: {table}")
            statements = [
                f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS created_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;",
                f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS updated_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL;"
            ]
            
            for stmt in statements:
                try:
                    cursor.execute(stmt)
                    print(f"    Executed: {stmt[:50]}...")
                except Exception as e:
                    print(f"    Error on {table}: {e}")
                    conn.rollback()

        conn.commit()
        print("Pure Migration completed successfully!")
        
    except Exception as e:
        print("Fatal error during pure migration:", e)
    finally:
        if 'conn' in locals(): conn.close()

if __name__ == '__main__':
    migrate_pure()
