from sqlalchemy import create_engine, MetaData
from models import *
from extensions import db
from flask import Flask
from extensions import bcrypt

app = Flask(__name__)
# Exact URI from app.py
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:root@localhost/naac_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt.init_app(app)

with app.app_context():
    print("Reflecting current messy database schema...")
    engine = db.engine
    metadata = MetaData()
    metadata.reflect(bind=engine)
    
    print(f"Found {len(metadata.tables)} tables. Dropping all of them...")
    metadata.drop_all(bind=engine)
    print("All old tables dropped successfully!")
    
    print("Creating beautifully normalized NAAC tables...")
    db.create_all()
    print("Schema created successfully!")
    
    admin = User(username='admin')
    admin.password_hash = bcrypt.generate_password_hash('admin').decode('utf-8')
    admin.role = 'admin'
    admin.status = 'active'
    db.session.add(admin)
    db.session.commit()
    print("Restored 'admin' / 'admin' default login access.")
    print("MIGRATION COMPLETE.")
