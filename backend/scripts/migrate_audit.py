import os
from flask import Flask
from extensions import db
from app import create_app

def migrate_audit():
    app = create_app()
    with app.app_context():
        connection = db.engine.raw_connection()
        try:
            cursor = connection.cursor()
            
            # List all tables in the public schema
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
            tables = [row[0] for row in cursor.fetchall()]
            
            print(f"Found {len(tables)} tables. Adding audit columns...")
            for table in tables:
                if table == 'alembic_version': continue
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
                        print(f"  Executed: {stmt[:40]}...")
                    except Exception as e:
                        print(f"  Error on {table}: {e}")
                        connection.rollback()
            
            connection.commit()
            print("Audit migration completed successfully!")
            
        except Exception as e:
            print("Fatal error during audit migration:", e)
            connection.rollback()
        finally:
            connection.close()

if __name__ == '__main__':
    migrate_audit()
