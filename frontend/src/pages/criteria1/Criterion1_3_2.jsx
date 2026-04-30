// ============================================================
// Criterion1_3_2.jsx — 1.3.2 Experiential Learning Through Projects
// Course type dropdown from API, auto-fills course code
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { 
  getProgramCodes, getCourseTypes, getRecords, addRecord, deleteRecord, updateRecord,
  getStudents, uploadStudents, uploadEvidence, getExcelExportUrl
} from "../../api/apiService";

const emptyForm = {
  programName: "MCA", programCode: "", courseType: "", courseCode: "",
  year: "", studentName: "", docLink: "", pdfFile: null
};

export default function Criterion1_3_2() {
  const [programCodes, setProgramCodes] = useState([]);
  const [courseTypes, setCourseTypes]   = useState([]);
  const [records, setRecords]           = useState([]);
  const [form, setForm]                 = useState(emptyForm);
  const [editRecord, setEditRecord]     = useState(null);
  const [alert, setAlert]               = useState(null);
  
  const [students, setStudents]         = useState([]);
  const [studentFile, setStudentFile]   = useState(null);
  const [uploadingStudent, setUploadingStudent] = useState(false);
  const [proofFiles, setProofFiles]     = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    Promise.all([getProgramCodes(), getCourseTypes(), getRecords("1_3_2")])
      .then(([pc, ct, recs]) => {
        setProgramCodes(pc);
        setCourseTypes(ct);
        setRecords(recs);
      });
  }, []);

  const handleCourseTypeChange = async (value) => {
    const ct = courseTypes.find(c => c.value === value);
    const code = ct ? ct.courseCode : "";
    setForm({ ...form, courseType: value, courseCode: code, studentName: "" });
    if (code) {
      const data = await getStudents(code);
      setStudents(data);
    } else {
      setStudents([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addRecord("1_3_2", { ...form });
    if (result.success) { setRecords(prev => [...prev, result.data]); setForm(emptyForm); }
    showAlert("Record added!", "success");
  };

  const handleStudentUpload = async () => {
    if (!studentFile) return showAlert("Please select a CSV/Excel file", "warning");
    setUploadingStudent(true);
    const formData = new FormData();
    formData.append("file", studentFile);
    const res = await uploadStudents(formData);
    setUploadingStudent(false);
    if (res.success) {
      showAlert(res.message, "success");
      if (form.courseCode) {
        const data = await getStudents(form.courseCode);
        setStudents(data);
      }
    } else {
      showAlert("Upload failed: " + res.error, "danger");
    }
  };

  const handleProofUpload = async () => {
    if (!proofFiles || proofFiles.length === 0) return showAlert("Please select files first.", "warning");
    setUploadingProof(true);
    const res = await uploadEvidence("1_3_2", proofFiles);
    setUploadingProof(false);
    if (res.success) {
        setForm({ ...form, docLink: "http://localhost:5000" + res.link, pdfPath: res.link });
        showAlert("Proof files uploaded and combined into PDF successfully!", "success");
    } else {
        showAlert("Upload failed: " + res.error, "danger");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteRecord("1_3_2", id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await updateRecord("1_3_2", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Updated!", "success");
  };

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="1_3_2" />
      <div className="main-content">
        <header className="page-header">
          <h4>1.3.2 Experiential Learning through Projects</h4>
          <button className="btn btn-success btn-sm" onClick={() => window.open(getExcelExportUrl("1_3_2"), "_blank")}>
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4">
          {alert && <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
            {alert.msg}<button className="btn-close" onClick={() => setAlert(null)}></button>
          </div>}

          {/* Student CSV Upload Section */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4 bg-light rounded">
              <h6 className="fw-bold text-dark mb-3"><i className="bi bi-people-fill text-primary"></i> Upload Student List (CSV/Excel)</h6>
              <p className="text-muted small mb-3">Upload a CSV or Excel file containing student <strong>Name</strong> and <strong>Course Code</strong> columns. The system will automatically map FYMCA students to PBL-1 and SYMCA students to Major Project based on their assigned course codes.</p>
              <div className="row g-2 align-items-center">
                <div className="col-md-6">
                  <input type="file" className="form-control" accept=".csv, .xlsx, .xls" onChange={e => setStudentFile(e.target.files[0])} />
                </div>
                <div className="col-md-4">
                  <button className="btn btn-primary" onClick={handleStudentUpload} disabled={uploadingStudent}>
                    {uploadingStudent ? "Uploading..." : "Upload Students"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card border-0 shadow-sm mb-5">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-2">
                    <label className="form-label fw-bold small">Program Name</label>
                    <input type="text" className="form-control" value={form.programName} readOnly />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold small">Program Code</label>
                    {/* Dropdown from API */}
                    <select className="form-select" value={form.programCode}
                      onChange={e => setForm({ ...form, programCode: e.target.value })} required>
                      <option value="" disabled>Select Code</option>
                      {programCodes.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold small">Course Name</label>
                    {/* Dropdown from API — auto-fills course code */}
                    <select className="form-select" value={form.courseType}
                      onChange={e => handleCourseTypeChange(e.target.value)} required>
                      <option value="" disabled>Select Type</option>
                      {courseTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label fw-bold small">Course Code</label>
                    <input type="text" className="form-control bg-light" value={form.courseCode} readOnly />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold small">Year of Offering</label>
                    <input type="text" className="form-control" placeholder="2024-25" value={form.year}
                      onChange={e => setForm({ ...form, year: e.target.value })} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold small">Student Name</label>
                    <select className="form-select" value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} required>
                      <option value="" disabled>{form.courseCode ? "Select Student" : "Select Course First"}</option>
                      {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="col-md-5">
                    <label className="form-label fw-bold small">Document Link (Drive / System URL)</label>
                    <input type="url" className="form-control" placeholder="Generated automatically upon upload, or paste URL" value={form.docLink}
                      onChange={e => setForm({ ...form, docLink: e.target.value })} />
                  </div>
                  <div className="col-md-7">
                    <label className="form-label fw-bold small text-danger">Upload Evidence Files (PDF/Images)</label>
                    <div className="input-group">
                      <input type="file" className="form-control" multiple accept="image/*,.pdf"
                        onChange={e => setProofFiles(e.target.files)} />
                      <button type="button" className="btn btn-outline-danger" onClick={handleProofUpload} disabled={uploadingProof}>
                        {uploadingProof ? "Merging..." : "Merge & Get Link"}
                      </button>
                    </div>
                  </div>
                  <div className="col-12 text-end mt-4">
                    <button type="submit" className="btn btn-success px-5 fw-bold">Add Record</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive bg-white shadow-sm rounded">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th>Program</th><th>P.Code</th><th>Course</th><th>C.Code</th>
                  <th>Year</th><th>Student</th><th>Evidence</th><th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted py-4">No records yet.</td></tr>
                ) : records.map(row => (
                  <tr key={row.id}>
                    <td>{row.programName}</td>
                    <td><span className="badge bg-secondary">{row.programCode}</span></td>
                    <td>{row.courseType}</td>
                    <td><code>{row.courseCode}</code></td>
                    <td>{row.year}</td>
                    <td><strong>{row.studentName}</strong></td>
                    <td>
                      <div className="btn-group">
                        {row.docLink && <a href={row.docLink} target="_blank" className="btn btn-sm btn-outline-primary"><i className="bi bi-link"></i> Link</a>}
                        {row.pdfPath && <button className="btn btn-sm btn-outline-danger"><i className="bi bi-file-pdf"></i> PDF</button>}
                      </div>
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditRecord({ ...row })}>Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Edit Record: {editRecord.studentName}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Program Code</label>
                      <select className="form-select" value={editRecord.programCode || ""}
                        onChange={e => setEditRecord({ ...editRecord, programCode: e.target.value })}>
                        {programCodes.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Course Type</label>
                      <select className="form-select" value={editRecord.courseType || ""}
                        onChange={e => {
                          const ct = courseTypes.find(c => c.value === e.target.value);
                          setEditRecord({ ...editRecord, courseType: e.target.value, courseCode: ct?.courseCode || "" });
                        }}>
                        {courseTypes.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Course Code</label>
                      <input type="text" className="form-control" value={editRecord.courseCode || ""} readOnly />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Student Name</label>
                      <input type="text" className="form-control" value={editRecord.studentName || ""}
                        onChange={e => setEditRecord({ ...editRecord, studentName: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-danger">Update PDF (Optional)</label>
                      <input type="file" className="form-control" accept=".pdf" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
