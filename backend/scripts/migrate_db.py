import os
from flask import Flask
from extensions import db
from app import create_app

def migrate():
    app = create_app()
    with app.app_context():
        connection = db.engine.raw_connection()
        try:
            cursor = connection.cursor()

            migrations = [
                # Criteria 1
                ("ALTER TABLE c113_teacher_bodies ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES teachers(id);",
                 "UPDATE c113_teacher_bodies c SET teacher_id = t.id FROM teachers t WHERE c.teacher_name = t.name;"),
                 
                ("ALTER TABLE c121_cbcs ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id);",
                 "UPDATE c121_cbcs c SET program_id = p.id FROM programs p WHERE c.program_code = p.program_code;"),
                 
                ("ALTER TABLE c122_addon ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id);",
                 "UPDATE c122_addon c SET program_id = p.id FROM programs p WHERE c.program_name = p.program_name;"),
                ("ALTER TABLE c122_addon ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id);",
                 "UPDATE c122_addon c SET course_id = co.id FROM courses co WHERE c.course_code = co.course_code;"),
                 
                ("ALTER TABLE c132_experiential ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id);",
                 "UPDATE c132_experiential c SET program_id = p.id FROM programs p WHERE c.program_code = p.program_code;"),
                ("ALTER TABLE c132_experiential ADD COLUMN IF NOT EXISTS course_id INTEGER REFERENCES courses(id);",
                 "UPDATE c132_experiential c SET course_id = co.id FROM courses co WHERE c.course_code = co.course_code;"),
                ("ALTER TABLE c132_experiential ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id);",
                 "UPDATE c132_experiential c SET student_id = s.id FROM students s WHERE c.student_name = s.name;"),
                 
                ("ALTER TABLE c133_projects ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id);",
                 "UPDATE c133_projects c SET program_id = p.id FROM programs p WHERE c.program_code = p.program_code;"),

                # Criteria 2
                ("ALTER TABLE c211_enrolment ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id);",
                 "UPDATE c211_enrolment c SET program_id = p.id FROM programs p WHERE c.program_code = p.program_code;"),
                 
                ("ALTER TABLE c23_outgoing_students ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id);",
                 "UPDATE c23_outgoing_students c SET student_id = s.id FROM students s WHERE c.enrollment_number = s.enrollment_number;"),
                 
                ("ALTER TABLE c241_teachers ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES teachers(id);",
                 "UPDATE c241_teachers c SET teacher_id = t.id FROM teachers t WHERE c.teacher_name = t.name;"),
                 
                ("ALTER TABLE c263_pass_percentage ADD COLUMN IF NOT EXISTS program_id INTEGER REFERENCES programs(id);",
                 "UPDATE c263_pass_percentage c SET program_id = p.id FROM programs p WHERE c.program_code = p.program_code;"),

                # Criteria 3
                ("ALTER TABLE c3_research_projects ADD COLUMN IF NOT EXISTS pi_id INTEGER REFERENCES teachers(id);",
                 "UPDATE c3_research_projects c SET pi_id = t.id FROM teachers t WHERE c.pi_name = t.name;"),
                 
                ("ALTER TABLE c322_books ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES teachers(id);",
                 "UPDATE c322_books c SET teacher_id = t.id FROM teachers t WHERE c.teacher_name = t.name;"),

                # Criteria 5
                ("ALTER TABLE c521_placements ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id);",
                 "UPDATE c521_placements c SET student_id = s.id FROM students s WHERE c.student_name = s.name;"),
                 
                ("ALTER TABLE c522_higher_ed ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id);",
                 "UPDATE c522_higher_ed c SET student_id = s.id FROM students s WHERE c.student_name = s.name;"),
                 
                ("ALTER TABLE c523_qualifying_exams ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id);",
                 "UPDATE c523_qualifying_exams c SET student_id = s.id FROM students s WHERE c.student_name = s.name;"),
                 
                ("ALTER TABLE c531_sports_awards ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id);",
                 "UPDATE c531_sports_awards c SET student_id = s.id FROM students s WHERE c.student_name = s.name;"),
                 
                ("ALTER TABLE c533_sports_events ADD COLUMN IF NOT EXISTS student_id INTEGER REFERENCES students(id);",
                 "UPDATE c533_sports_events c SET student_id = s.id FROM students s WHERE c.student_name = s.name;"),

                # Criteria 6
                ("ALTER TABLE c632_teacher_financial ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES teachers(id);",
                 "UPDATE c632_teacher_financial c SET teacher_id = t.id FROM teachers t WHERE c.teacher_name = t.name;"),
                 
                ("ALTER TABLE c634_teacher_fdp ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES teachers(id);",
                 "UPDATE c634_teacher_fdp c SET teacher_id = t.id FROM teachers t WHERE c.teacher_name = t.name;")
            ]

            print("Executing automated String-To-ForeignKey migrations...")
            for add_col, migrate_data in migrations:
                try:
                    cursor.execute(add_col)
                    cursor.execute(migrate_data)
                except Exception as ex:
                    print(f"Skipping or error during statement: {ex}")

            # Option to drop old string columns. We won't drop them to avoid permanently deleting data that couldn't map natively
            # But the new Models.py won't reference them.
            
            connection.commit()
            print("Migration completed Successfully!")

        except Exception as e:
            connection.rollback()
            print("Fatal Migration Error:", e)
        finally:
            connection.close()

if __name__ == '__main__':
    migrate()
