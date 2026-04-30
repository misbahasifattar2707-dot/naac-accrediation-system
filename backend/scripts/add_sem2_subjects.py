import sys
from app import create_app
from extensions import db
from models import Course

app = create_app()
with app.app_context():
    subjects = [
        ('310916A', 'Mobile Computing'),
        ('310916B', 'Artificial Intelligence'),
        ('310916C', 'Cyber Security'),
        ('310916D', 'Block Chain'),
        ('310916E', 'Open Elective'),
    ]
    for code, name in subjects:
        existing = Course.query.filter_by(course_code=code).first()
        if not existing:
            c = Course(program_id=2, course_code=code, course_name=name, year_of_intro='2020')
            db.session.add(c)
        else:
            existing.course_name = name
            existing.year_of_intro = '2020'
            existing.program_id = 2
    db.session.commit()
    print("Subjects Added/Updated!")
