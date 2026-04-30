from app import create_app
from extensions import db
from models import Record122_123, ProofLink122_123, AcademicYear, AddonSubject

app = create_app()

with app.app_context():
    print("Dropping old 122 tables...")
    Record122_123.__table__.drop(db.engine, checkfirst=True)
    ProofLink122_123.__table__.drop(db.engine, checkfirst=True)
    AcademicYear.__table__.drop(db.engine, checkfirst=True)
    AddonSubject.__table__.drop(db.engine, checkfirst=True)
    
    print("Creating all tables...")
    db.create_all()

    # Seed some academic years and addon subjects
    if AcademicYear.query.count() == 0:
        db.session.add_all([
            AcademicYear(year_name="2023-24"),
            AcademicYear(year_name="2024-25"),
            AcademicYear(year_name="2025-26")
        ])
        db.session.commit()
    print("Migration complete.")
