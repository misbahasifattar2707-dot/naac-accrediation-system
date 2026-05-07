import os
import uuid
from flask import Blueprint, jsonify, request, session, current_app, send_file
from werkzeug.utils import secure_filename
from models.models import *
from extensions import db, bcrypt
import pandas as pd
from datetime import datetime, date
from decimal import Decimal

api_bp = Blueprint('api_bp', __name__, url_prefix='/api')

# --- Auth Endpoints ---

@api_bp.route('/register', methods=['POST'])
def api_register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'Admin')
    department = data.get('department', '')
    user_identifier = data.get('user_identifier', '')
    year = data.get('year', '')

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "error": "Username already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(
        username=username, 
        password=hashed_pw, 
        role=role, 
        department=department,
        user_identifier=user_identifier,
        year=year
    )
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"success": True, "message": "Account created"})


@api_bp.route('/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    academic_year = data.get('academic_year')
    
    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400
        
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        session['user_id'] = user.id
        session['academic_year'] = academic_year
        
        return jsonify({
            "success": True, 
            "user": {
                "id": user.id, 
                "username": user.username, 
                "role": user.role, 
                "department": user.department,
                "academic_year": academic_year or user.year,
                "program": "MCA",
                "programCode": "515124110"
            }
        })
    return jsonify({"success": False, "error": "Invalid username or password"}), 401


# --- Metadata Endpoints ---

@api_bp.route('/teachers', methods=['GET'])
def get_teachers():
    teachers = Teacher.query.all()
    return jsonify([{"id": t.id, "name": t.name} for t in teachers])

@api_bp.route('/departments', methods=['GET'])
def get_departments():
    progs = Program.query.all()
    res, seen = [], set()
    for p in progs:
        dept = p.department or p.program_name
        if dept not in seen:
            seen.add(dept)
            res.append({"id": p.id, "code": dept, "programCode": p.program_code, "programName": p.program_name})
    if not res:
        res = [{"id": 1, "code": "MCA", "programCode": "515124110", "programName": "MCA"}]
    return jsonify(res)

@api_bp.route('/semesters', methods=['GET'])
def get_semesters():
    recs = SemesterLookup.query.all()
    if not recs:
        # Default seed
        defaults = ["FYMCA-SEM-I (MCA)", "FYMCA-SEM-II (MCA)", "SYMCA-SEM-III (MCA)", "SYMCA-SEM-IV (MCA)"]
        for d in defaults: db.session.add(SemesterLookup(value=d))
        db.session.commit()
        recs = SemesterLookup.query.all()
    return jsonify([{"value": x.value, "label": x.value} for x in recs])

@api_bp.route('/courses', methods=['GET'])
def get_courses():
    """
    GET /api/courses          → all courses in SemesterCourseLookup
    GET /api/courses?sem=X    → courses for that semester only
    """
    sem = request.args.get('sem')
    q = SemesterCourseLookup.query
    if sem:
        q = q.filter(SemesterCourseLookup.semester == sem)
    rows = q.order_by(SemesterCourseLookup.course_code).all()
    return jsonify([{"code": r.course_code, "name": r.course_name, "semester": r.semester} for r in rows])

@api_bp.route('/courses', methods=['POST'])
def add_course():
    """
    POST /api/courses  { semester, course_code, course_name }
    Adds a new course to SemesterCourseLookup with normalisation + uniqueness check.
    """
    data = request.json or {}
    sem    = (data.get('semester') or '').strip()
    c_code = (data.get('course_code') or '').strip().upper()
    c_name = (data.get('course_name') or '').strip()

    if not sem or not c_code or not c_name:
        return jsonify({"success": False, "error": "semester, course_code and course_name are required"}), 400

    existing = SemesterCourseLookup.query.filter_by(semester=sem, course_code=c_code).first()
    if existing:
        return jsonify({"success": False, "error": f"Course {c_code} already exists in {sem}"}), 400

    try:
        new_c = SemesterCourseLookup(semester=sem, course_code=c_code, course_name=c_name)
        db.session.add(new_c)
        db.session.commit()
        return jsonify({"success": True, "course": {"code": c_code, "name": c_name, "semester": sem}})
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 400


@api_bp.route('/electives', methods=['GET'])
def get_electives():
    # Attempting to load by 310916% or elective
    courses = Course.query.filter((Course.course_code.like('310916%')) | (Course.course_name.ilike('%elective%'))).all()
    return jsonify([{"id": c.id, "code": c.course_code, "name": c.course_name} for c in courses])

@api_bp.route('/program-codes', methods=['GET'])
def get_program_codes():
    progs = Program.query.all()
    return jsonify([{"code": p.program_code, "label": p.program_code} for p in progs])

@api_bp.route('/course-types', methods=['GET'])
def get_course_types():
    recs = CourseTypeLookup.query.all()
    if not recs:
        defaults = ["PBL (Project Based Learning)", "Major Project"]
        for d in defaults: db.session.add(CourseTypeLookup(value=d))
        db.session.commit()
        recs = CourseTypeLookup.query.all()
    # Note: legacy code returned courseCode. Keeping the structure.
    return jsonify([{"value": x.value, "label": x.value, "courseCode": ""} for x in recs])

@api_bp.route('/academic-years', methods=['GET'])
def get_academic_years():
    recs = AcademicYearLookup.query.all()
    if not recs:
        defaults = ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27"]
        for d in defaults: db.session.add(AcademicYearLookup(value=d))
        db.session.commit()
        recs = AcademicYearLookup.query.all()
    return jsonify([x.value for x in recs])

@api_bp.route('/programmes', methods=['GET'])
def get_programmes():
    progs = Program.query.all()
    if not progs:
        return jsonify([
            {"code": "MCA",  "name": "Master of Computer Applications (MCA)"},
            {"code": "MBA",  "name": "Master of Business Administration (MBA)"}
        ])
    return jsonify([{"code": p.program_code, "name": p.program_name} for p in progs])

@api_bp.route('/reserved-categories', methods=['GET'])
def get_reserved_categories():
    recs = ReservedCategoryLookup.query.all()
    if not recs:
        defaults = ["SC", "ST", "OBC", "Divyangjan", "Gen-EWS", "Others"]
        for d in defaults: db.session.add(ReservedCategoryLookup(value=d))
        db.session.commit()
        recs = ReservedCategoryLookup.query.all()
    return jsonify([x.value for x in recs])

@api_bp.route('/library-resources', methods=['GET'])
def get_library_resources():
    recs = LibraryResourceLookup.query.all()
    if not recs:
        defaults = ["Books", "Journals", "e-Journals", "e-Books", "e-ShodhSindhu", "Shodhganga", "Databases"]
        for d in defaults: db.session.add(LibraryResourceLookup(value=d))
        db.session.commit()
        recs = LibraryResourceLookup.query.all()
    return jsonify([x.value for x in recs])

@api_bp.route('/qualifying-exams', methods=['GET'])
def get_qualifying_exams():
    recs = QualifyingExamLookup.query.all()
    if not recs:
        defaults = ["NET", "SLET", "GATE", "GMAT", "CAT", "GRE", "JAM", "IELTS", "TOEFL", "Civil Services", "State government examinations", "Other examinations"]
        for d in defaults: db.session.add(QualifyingExamLookup(value=d))
        db.session.commit()
        recs = QualifyingExamLookup.query.all()
    return jsonify([{"value": x.value, "label": x.value} for x in recs])

@api_bp.route('/event-levels', methods=['GET'])
def get_event_levels():
    recs = EventLevelLookup.query.all()
    if not recs:
        defaults = ["Inter-university", "State", "National", "International", "District"]
        for d in defaults: db.session.add(EventLevelLookup(value=d))
        db.session.commit()
        recs = EventLevelLookup.query.all()
    return jsonify([{"value": x.value, "label": x.value} for x in recs])

@api_bp.route('/award-categories', methods=['GET'])
def get_award_categories():
    recs = AwardCategoryLookup.query.all()
    if not recs:
        defaults = ["Individual", "Team"]
        for d in defaults: db.session.add(AwardCategoryLookup(value=d))
        db.session.commit()
        recs = AwardCategoryLookup.query.all()
    return jsonify([{"value": x.value, "label": x.value} for x in recs])

# --- Generic POST Endpoint to add new lookup items ---
LOOKUP_MODELS = {
    "semesters": SemesterLookup,
    "course-types": CourseTypeLookup,
    "academic-years": AcademicYearLookup,
    "reserved-categories": ReservedCategoryLookup,
    "library-resources": LibraryResourceLookup,
    "qualifying-exams": QualifyingExamLookup,
    "event-levels": EventLevelLookup,
    "award-categories": AwardCategoryLookup,
    "departments": DepartmentLookup,
    "designations": DesignationLookup,
    "highest-degrees": HighestDegreeLookup,
    "appointment-types": AppointmentTypeLookup,
    "funding-agencies": FundingAgencyLookup,
    "levels": LevelLookup,
    "team-individual": TeamIndividualLookup,
    "egovernance-areas": EGovernanceAreaLookup
}

# --- Dedicated Getters for new Lookups ---

@api_bp.route('/get-lookups/<lookup_key>', methods=['GET'])
def get_lookup_values(lookup_key):
    model = LOOKUP_MODELS.get(lookup_key)
    if not model: return jsonify([])
    recs = model.query.all()
    # Handle different models if needed, but most use .value
    return jsonify([{"id": r.id, "value": r.value, "label": r.value} for r in recs])

@api_bp.route('/lookups/<lookup_key>', methods=['POST'])
def add_lookup_value(lookup_key):
    model = LOOKUP_MODELS.get(lookup_key)
    if not model:
        return jsonify({"success": False, "error": "Invalid lookup key"}), 404
        
    data = request.json
    new_val = data.get('value')
    if not new_val:
        return jsonify({"success": False, "error": "Value required"}), 400
        
    existing = model.query.filter_by(value=new_val).first()
    if not existing:
        try:
            new_item = model(value=new_val)
            db.session.add(new_item)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"success": False, "error": str(e)}), 400
            
    return jsonify({"success": True, "message": f"Added {new_val}"})

# --- Generic Criteria Router ---

CRITERIA_MODELS = {
    "1_1": C11Courses, "1_1_3": C113TeacherBodies, "1_2_1": C121CBCS, "1_2_2": C122Addon, 
    "1_3_2": C132Experiential, "1_3_3": C133Projects, 
    "2_1_1": C211Enrolment, "2_1_2": C212Reservation, "2_3": C23OutgoingStudents,
    "2_3_3": C233MentorRatio, "2_4_1": C241Teachers, "2_4_2": C242TeacherPhD, "2_6_3": C263PassPercentage,
    "4_1_3": C413ICTRooms, "4_1_4": C4Expenditure, "4_2_2": C42Library,
    "5_1_1": C511Scholarships, "5_1_3": C513SkillInitiatives, "5_1_4": C514CompetitiveExams,
    "5_2_1": C521Placements, "5_2_2": C522HigherEd, "5_2_3": C523QualifyingExams,
    "5_3_1": C531SportsAwards, "5_3_3": C533SportsEvents,
}

from decimal import Decimal
from datetime import date

def to_dict(rec):
    d = {}
    for col in rec.__table__.columns:
        val = getattr(rec, col.name)
        if isinstance(val, date): val = val.isoformat()
        if isinstance(val, Decimal): val = float(val)
        if isinstance(val, datetime): val = val.isoformat()
        d[col.name] = val
        
        # UI Aliasing
        if col.name == 'academic_year' or col.name == 'year_of_offering':
            d['year'] = val
        if col.name == 'status_of_implementation':
            d['cbcsStatus'] = "Yes" if val else "No"
        if col.name == 'year_of_implementation':
            d['cbcsYear'] = val

    # Lookup related names for the UI tables
    if hasattr(rec, 'course_id') and rec.course_id:
        c = Course.query.get(rec.course_id)
        if c: d['courseCode'] = c.course_code; d['courseName'] = c.course_name
    if hasattr(rec, 'program_id') and rec.program_id:
        p = Program.query.get(rec.program_id)
        if p: d['programCode'] = p.program_code; d['programName'] = p.program_name
    if hasattr(rec, 'teacher_id') and rec.teacher_id:
        t = Teacher.query.get(rec.teacher_id)
        if t: d['teacherName'] = t.name
    if hasattr(rec, 'student_id') and rec.student_id:
        s = Student.query.get(rec.student_id)
        if s: d['enrollmentNumber'] = s.enrollment_number; d['studentName'] = s.name
            
    # Resolve Usernames for auditing
    if hasattr(rec, 'created_by_id') and rec.created_by_id:
        u = User.query.get(rec.created_by_id)
        if u: d['createdBy'] = u.username
    if hasattr(rec, 'updated_by_id') and rec.updated_by_id:
        u = User.query.get(rec.updated_by_id)
        if u: d['updatedBy'] = u.username

    return d

@api_bp.route('/records/<criterion>', methods=['GET'])
def get_records(criterion):
    model = CRITERIA_MODELS.get(criterion)
    if not model: return jsonify([])
    
    if criterion == '1_1':
        # Enrich with semester name (stored as programName in C11Courses via program relation)
        records = C11Courses.query.all()
        result = []
        for r in records:
            d = to_dict(r)
            # Also resolve semester from SemesterCourseLookup using course_code
            if r.course_id:
                c = Course.query.get(r.course_id)
                if c:
                    scl = SemesterCourseLookup.query.filter_by(course_code=c.course_code).first()
                    if scl: d['programName'] = scl.semester
            result.append(d)
        return jsonify(result)
    
    return jsonify([to_dict(r) for r in model.query.all()])

# ---- Dedicated POST for Criterion 1.1 ----
@api_bp.route('/records/1_1', methods=['POST'])
def add_record_1_1():
    """
    Handles Criterion 1.1 form submission.
    UI sends: { department, programCode, programName (=semester), courseCode, courseName, year }
    Maps to C11Courses: { academic_year, program_id, course_id }
    """
    data = request.json or {}
    
    semester    = data.get('programName', '').strip()  # "FYMCA-SEM-I", etc.
    program_code= data.get('programCode', '').strip()
    course_code = data.get('courseCode', '').strip()
    year        = str(data.get('year', '')).strip()
    department  = data.get('department', '').strip()

    # --- Validate required fields ---
    if not semester:
        return jsonify({"success": False, "error": "Semester (Program Name) is required"}), 400
    if not course_code:
        return jsonify({"success": False, "error": "Course Code is required"}), 400
    if not year:
        return jsonify({"success": False, "error": "Year is required"}), 400

    # --- 1. Resolve / auto-create Program ---
    prog = Program.query.filter_by(program_code=program_code).first() if program_code else None
    if not prog:
        # Create a minimal program entry so FK is satisfied
        prog = Program(
            program_code = program_code or semester,
            program_name = semester,
            department   = department
        )
        db.session.add(prog)
        db.session.flush()   # get prog.id without committing

    # --- 2. Resolve / auto-create Course (in the Course dim table) ---
    course = Course.query.filter_by(course_code=course_code).first()
    if not course:
        # Pull course name from the lookup table
        scl = SemesterCourseLookup.query.filter_by(
            semester=semester, course_code=course_code
        ).first()
        course_name = scl.course_name if scl else data.get('courseName', course_code)
        course = Course(course_code=course_code, course_name=course_name)
        db.session.add(course)
        db.session.flush()

    # --- 3. Duplicate check: same year + program + course ---
    existing = C11Courses.query.filter_by(
        academic_year=year,
        program_id=prog.id,
        course_id=course.id
    ).first()
    if existing:
        return jsonify({"success": False, "error": f"Course {course_code} for {semester} in {year} already exists"}), 400

    # --- 4. Insert record ---
    try:
        new_rec = C11Courses(
            academic_year = year,
            program_id    = prog.id,
            course_id     = course.id,
            proof_links   = data.get('proofLink'),
            created_by_id = session.get('user_id'),
            updated_by_id = session.get('user_id')
        )
        db.session.add(new_rec)
        db.session.commit()
        return jsonify({"success": True, "data": to_dict(new_rec)})
    except Exception as e:
        db.session.rollback()
        import traceback; traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 400

@api_bp.route('/records/<criterion>', methods=['POST'])
def add_record(criterion):
    model = CRITERIA_MODELS.get(criterion)
    if not model: return jsonify({"success": False, "error": "Criterion not found"}), 404
    
    data = request.json
    db_kwargs = {}
    
    # Audit tracking
    user_id = session.get('user_id')
    db_kwargs['created_by_id'] = user_id
    db_kwargs['updated_by_id'] = user_id
    
    # Select All Optimization
    if data.get('select_all') is True:
        if 'programCode' in data:
            prog = Program.query.filter_by(program_code=data['programCode']).first()
            all_studs = Student.query.filter_by(program_id=prog.id).all() if prog else Student.query.all()
        else:
            all_studs = Student.query.all()
        data['student_list'] = ", ".join([s.name for s in all_studs])

    # 1. Map common foreign keys dynamically based on UI selections
    if 'courseCode' in data:
        c = Course.query.filter_by(course_code=data['courseCode']).first()
        if c and hasattr(model, 'course_id'): db_kwargs['course_id'] = c.id
    if 'programCode' in data:
        p = Program.query.filter_by(program_code=data['programCode']).first()
        if p and hasattr(model, 'program_id'): db_kwargs['program_id'] = p.id
    if 'teacherName' in data:
        t = Teacher.query.filter_by(name=data['teacherName']).first()
        if t and hasattr(model, 'teacher_id'): db_kwargs['teacher_id'] = t.id
        
    # 2. Map payload keys to model columns
    for col in model.__table__.columns:
        col_name = col.name
        if col_name == 'id': continue
        
        # Direct match
        if col_name in data and data[col_name] is not None:
            if col_name == 'status_of_implementation':
                 db_kwargs[col_name] = str(data[col_name]).lower() == "yes"
            else:
                 db_kwargs[col_name] = data[col_name]
        else:
            # Common UI -> DB Alias mapping
            if col_name == 'academic_year' and 'year' in data:
                db_kwargs[col_name] = data['year']
            elif col_name == 'year_of_offering' and 'year' in data:
                db_kwargs[col_name] = int(data['year']) if str(data['year']).isdigit() else None
            elif col_name == 'year_of_passing' and 'year' in data:
                db_kwargs[col_name] = int(data['year']) if str(data['year']).isdigit() else None
            elif col_name == 'year_of_implementation' and 'cbcsYear' in data:
                db_kwargs[col_name] = int(data['cbcsYear']) if str(data['cbcsYear']).isdigit() else None
            elif col_name == 'status_of_implementation' and 'cbcsStatus' in data:
                db_kwargs[col_name] = str(data['cbcsStatus']).lower() == "yes"

    # Default Academic Year from session if missing in payload
    if 'academic_year' not in db_kwargs and hasattr(model, 'academic_year'):
        db_kwargs['academic_year'] = session.get('academic_year')

    try:
        new_rec = model(**db_kwargs)
        db.session.add(new_rec)
        db.session.commit()
        return jsonify({"success": True, "data": to_dict(new_rec)})
    except Exception as e:
        db.session.rollback()
        import traceback; traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 400

@api_bp.route('/records/<criterion>/<int:id>', methods=['PUT'])
def update_record(criterion, id):
    model = CRITERIA_MODELS.get(criterion)
    if not model: return jsonify({"success": False}), 404
    rec = model.query.get(id)
    if not rec: return jsonify({"success": False}), 404
    
    data = request.json
    
    # Audit tracking
    rec.updated_by_id = session.get('user_id')
    
    # Select All Optimization
    if data.get('select_all') is True:
        if 'programCode' in data:
            prog = Program.query.filter_by(program_code=data['programCode']).first()
            all_studs = Student.query.filter_by(program_id=prog.id).all() if prog else Student.query.all()
        else:
            all_studs = Student.query.all()
        data['student_list'] = ", ".join([s.name for s in all_studs])

    if 'courseCode' in data:
        c = Course.query.filter_by(course_code=data['courseCode']).first()
        if c and hasattr(model, 'course_id'): rec.course_id = c.id
    if 'programCode' in data:
        p = Program.query.filter_by(program_code=data['programCode']).first()
        if p and hasattr(model, 'program_id'): rec.program_id = p.id
        
    for col in model.__table__.columns:
        col_name = col.name
        if col_name == 'id': continue
        if col_name in data:
            if col_name == 'status_of_implementation':
                setattr(rec, col_name, str(data[col_name]).lower() == "yes")
            else:
                setattr(rec, col_name, data[col_name])
        else:
            if col_name == 'academic_year' and 'year' in data:
                setattr(rec, col_name, data['year'])
            elif col_name == 'year_of_offering' and 'year' in data:
                setattr(rec, col_name, int(data['year']) if str(data['year']).isdigit() else getattr(rec, col_name))
            elif col_name == 'year_of_implementation' and 'cbcsYear' in data:
                setattr(rec, col_name, int(data['cbcsYear']) if str(data['cbcsYear']).isdigit() else getattr(rec, col_name))
            elif col_name == 'status_of_implementation' and 'cbcsStatus' in data:
                setattr(rec, col_name, str(data['cbcsStatus']).lower() == "yes")
    db.session.commit()
    return jsonify({"success": True, "data": to_dict(rec)})

@api_bp.route('/records/<criterion>/<int:id>', methods=['DELETE'])
def delete_record(criterion, id):
    model = CRITERIA_MODELS.get(criterion)
    if model:
        rec = model.query.get(id)
        if rec:
            db.session.delete(rec)
            db.session.commit()
    return jsonify({"success": True})

@api_bp.route('/records/<criterion>/bulk-delete', methods=['POST'])
def bulk_delete(criterion):
    model = CRITERIA_MODELS.get(criterion)
    if model:
        ids = request.json.get('ids', [])
        model.query.filter(model.id.in_(ids)).delete(synchronize_session=False)
        db.session.commit()
    return jsonify({"success": True})
