// ============================================================
// apiService.js — THE KEY FILE
//
// HOW TO SWITCH TO REAL BACKEND:
//   1. Set USE_MOCK = false
//   2. Set BASE_URL to your backend URL
//   Done! Every dropdown & record call goes to real API.
//
// SHARE THIS WITH YOUR BACKEND DEVELOPER:
//   GET  /api/teachers              → [{id, name}]
//   GET  /api/departments           → [{id, code, programCode, programName}]
//   GET  /api/semesters             → [{value, label}]
//   GET  /api/courses?sem=X         → [{code, name}]
//   GET  /api/electives             → [{code, name}]
//   GET  /api/program-codes         → [{code, label}]
//   GET  /api/course-types          → [{value, label, courseCode}]
//   --- CRITERIA 2 ---
//   GET  /api/academic-years        → ["2021-22","2022-23","2023-24","2024-25"]
//   GET  /api/programmes            → [{code, name}]
//   GET  /api/reserved-categories   → ["SC","ST","OBC","Divyangjan","Gen-EWS","Others"]
//   GET  /api/records/2_4_1_nature_options → string[]  (e.g. ["Regular","Temporary","Permanent"])
//   GET  /api/records/2_4_2_qualification_options → string[]  (e.g. ["Ph.D.","NET","SET","SLET"])
//   --- RECORDS ---
//   GET  /api/records/:criterion        → [array of records]
//   POST /api/records/:criterion        → {success, data}
//   PUT  /api/records/:criterion/:id    → {success}
//   DELETE /api/records/:criterion/:id  → {success}
//   POST /api/records/:criterion/bulk-delete → {success}
// ============================================================

const BASE_URL = "http://localhost:5000/api";

// ---- Helper ----
async function apiFetch(url) {
  const res = await fetch(`${BASE_URL}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ============================================================
// DROPDOWN DATA — called on component mount
// ============================================================

export const getTeachers = async () => {
  return apiFetch("/teachers");
};

export const getDepartments = async () => {
  return apiFetch("/departments");
};

export const getSemesters = async () => {
  return apiFetch("/semesters");
};

export const getCoursesBySemester = async (semester) => {
  return apiFetch(`/courses?sem=${encodeURIComponent(semester)}`);
};

export const addCourse = async (semester, courseCode, courseName) => {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ semester, course_code: courseCode, course_name: courseName }),
  });
  return res.json();
};

export const getElectiveSubjects = async () => {
  return apiFetch("/electives");
};

export const getProgramCodes = async () => {
  return apiFetch("/program-codes");
};

export const getCourseTypes = async () => {
  return apiFetch("/course-types");
};

// ============================================================
// RECORDS CRUD — criterion name is the key
// e.g. criterion = "1_1" | "1_1_3" | "1_2_1" | etc.
// ============================================================

export const getRecords = async (criterion) => {
  return apiFetch(`/records/${criterion}`);
};

export const addRecord = async (criterion, data) => {
  const res = await fetch(`${BASE_URL}/records/${criterion}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateRecord = async (criterion, id, data) => {
  const res = await fetch(`${BASE_URL}/records/${criterion}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteRecord = async (criterion, id) => {
  const res = await fetch(`${BASE_URL}/records/${criterion}/${id}`, {
    method: "DELETE",
  });
  return res.json();
};

export const deleteRecordsBulk = async (criterion, ids) => {
  const res = await fetch(`${BASE_URL}/records/${criterion}/bulk-delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  return res.json();
};

export const addLookup = async (lookupKey, value) => {
  const res = await fetch(`${BASE_URL}/lookups/${lookupKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  return res.json();
};

// ============================================================
// CRITERIA 2 DROPDOWN DATA
// ============================================================

export const getAcademicYears = async () => {
  return apiFetch("/academic-years");
};

export const getProgrammes = async () => {
  return apiFetch("/programmes");
};

export const getReservedCategories = async () => {
  return apiFetch("/reserved-categories");
};

// ============================================================
// CRITERIA 4 DROPDOWN DATA
// GET /api/library-resources → string[]
// ============================================================
export const getLibraryResources = async () => {
  return apiFetch("/library-resources");
};

// ============================================================
// CRITERIA 5 DROPDOWN DATA
// GET /api/qualifying-exams  → [{value, label}]
// GET /api/event-levels      → [{value, label}]
// GET /api/award-categories  → [{value, label}]
// ============================================================
export const getQualifyingExams = async () => {
  return apiFetch("/qualifying-exams");
};

export const getEventLevels = async () => {
  return apiFetch("/event-levels");
};

export const getAwardCategories = async () => {
  return apiFetch("/award-categories");
};

export const getLookupValues = async (lookupKey) => {
  return apiFetch(`/get-lookups/${lookupKey}`);
};

// ============================================================
// STUDENTS (DYNAMIC)
// ============================================================
export const getStudents = async (courseCode = null) => {
  const url = courseCode ? `/students?course_code=${encodeURIComponent(courseCode)}` : "/students";
  return apiFetch(url);
};

export const addStudent = async (studentData) => {
  const res = await fetch(`${BASE_URL}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentData),
  });
  return res.json();
};

export const uploadStudents = async (formData) => {
  const res = await fetch(`${BASE_URL}/students/upload`, {
    method: "POST",
    body: formData, // do not set content-type for formData
  });
  return res.json();
};

// ============================================================
// EVIDENCE UPLOAD & EXPORT
// ============================================================
export const uploadEvidence = async (criterion, files, recordId = null) => {
  const formData = new FormData();
  formData.append("criterion", criterion);
  if (recordId) formData.append("record_id", recordId);
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
  const res = await fetch(`${BASE_URL}/upload-evidence`, {
    method: "POST",
    body: formData,
  });
  return res.json();
};

export const getExcelExportUrl = (criterion) => {
  return `${BASE_URL}/export-excel/${criterion}`;
};