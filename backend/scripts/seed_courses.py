"""
seed_courses.py — Run once to populate SemesterCourseLookup and SemesterLookup
Usage:  python seed_courses.py
"""
from app import app, db
from models import SemesterCourseLookup, SemesterLookup

SEED_DATA = {
    "FYMCA-SEM-I": [
        ("310901", "Discrete Mathematics and Statistics"),
        ("310902", "Data Structures and Algorithms"),
        ("310903", "Object Oriented Programming"),
        ("310904", "Software Engineering & Project Management"),
        ("310905", "Information Systems and Engineering Economics"),
        ("310906", "Data Structures and Algorithms Laboratory"),
        ("310907", "Object Oriented Programming Laboratory"),
        ("310908", "Python Programming Laboratory"),
        ("310909", "Business Communication Lab"),
        ("310910", "Audit Course"),
        ("310911", "Non Credit Course-1: MOOC Course-I"),
    ],
    "FYMCA-SEM-II": [
        ("310912", "Database Management System"),
        ("310913", "Computer Network"),
        ("310914", "Java Programming"),
        ("310915", "Operating System"),
        ("310916", "Elective-I"),
        ("310917", "Database Management System Laboratory"),
        ("310918", "Operating System Lab"),
        ("310919", "Java Programming Laboratory"),
        ("310920", "Project Based Learning-I"),
        ("310921", "Audit Course-2"),
        ("310922", "Non Credit Course-2: MOOC Course-II"),
    ],
    "SYMCA-SEM-III": [
        ("410901", "Data Science"),
        ("410902", "Web Technologies"),
        ("410903", "Cloud Computing"),
        ("410904", "Elective-II"),
        ("410905", "Software Testing and Quality Assurance"),
        ("410906", "Web Technologies Lab"),
        ("410907", "Computer Laboratory"),
        ("410908", "Data Science Laboratory"),
        ("410909", "Project Based Learning-II"),
        ("410910", "AC 3-I"),
        ("410911", "NCC3: MOOC Course-III"),
    ],
    "SYMCA-SEM-IV": [
        ("410912", "Major Project"),
        ("410913", "Seminar on Major Project"),
        ("410914", "Audit Course 4"),
    ],
}

def seed():
    with app.app_context():
        db.create_all()
        inserted_courses = 0
        inserted_sems    = 0

        for semester, courses in SEED_DATA.items():
            # Seed SemesterLookup if not already there
            if not SemesterLookup.query.filter_by(value=semester).first():
                db.session.add(SemesterLookup(value=semester))
                inserted_sems += 1

            # Seed SemesterCourseLookup
            for code, name in courses:
                existing = SemesterCourseLookup.query.filter_by(
                    semester=semester, course_code=code
                ).first()
                if not existing:
                    db.session.add(SemesterCourseLookup(
                        semester=semester,
                        course_code=code,
                        course_name=name
                    ))
                    inserted_courses += 1

        db.session.commit()
        print(f"✅ Seeding complete!")
        print(f"   Semesters inserted : {inserted_sems}")
        print(f"   Courses inserted   : {inserted_courses}")

if __name__ == '__main__':
    seed()
