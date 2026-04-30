// ============================================================
// Criterion5_2_3.jsx — 5.2.3: Students Qualifying in State/National Exams
// Exam dropdown is fetched from backend — no hardcoding
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, deleteRecord, getAcademicYears, getQualifyingExams } from "../../api/apiService";

const emptyForm = () => ({
  year: "", reg_no: "", student_name: "", exam_qualified: "", document: null
});

export default function Criterion5_2_3() {
  const [form, setForm]           = useState(emptyForm());
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [alert, setAlert]         = useState(null);
  const [yearOptions, setYearOptions]   = useState([]);
  const [examOptions, setExamOptions]   = useState([]);

  useEffect(() => {
    Promise.all([getRecords("5_2_3"), getAcademicYears(), getQualifyingExams()])
      .then(([recs, years, exams]) => {
        setRecords(recs); setYearOptions(years); setExamOptions(exams);
      })
      .finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleSave = async () => {
    if (!form.year || !form.reg_no || !form.student_name || !form.exam_qualified)
      return showAlert("All fields are required.", "danger");
    const result = await addRecord("5_2_3", {
      year: form.year, registration_no: form.reg_no,
      student_name: form.student_name, exam_qualified: form.exam_qualified
    });
    if (result.success) {
      setRecords(prev => [...prev, result.data]);
      setForm(emptyForm());
      showAlert("Record added!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("5_2_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="5_2_3" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 5</p>
            <h4>5.2.3: Students Qualifying in State/National Exams</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold">
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4 fade-in">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: 10 }}>
              <i className={`bi ${alert.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
              {alert.msg}
              <button className="btn-close ms-auto" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Qualifying Exam Record
              </h6>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="fw-bold small">Year</label>
                  <select className="form-select" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select Year</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="fw-bold small">Registration No.</label>
                  <input type="text" className="form-control" value={form.reg_no}
                    onChange={e => setForm({ ...form, reg_no: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="fw-bold small">Student Name</label>
                  <input type="text" className="form-control" value={form.student_name}
                    onChange={e => setForm({ ...form, student_name: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <label className="fw-bold small">Exam Name</label>
                  <select className="form-select" value={form.exam_qualified} onChange={e => setForm({ ...form, exam_qualified: e.target.value })}>
                    <option value="">Select Exam</option>
                    {examOptions.map(ex => <option key={ex.value} value={ex.value}>{ex.label}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="fw-bold small">Certificate</label>
                  <input type="file" className="form-control" accept=".pdf"
                    onChange={e => setForm({ ...form, document: e.target.files[0] })} />
                </div>
                <div className="col-md-12 text-end">
                  <button className="btn btn-danger" onClick={handleSave}>Add Data</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
            <div className="card-body p-3">
              {loading ? <div className="text-center py-4"><div className="spinner-border text-danger"></div></div> : (
                <div className="table-responsive">
                  <table className="table table-bordered bg-white">
                    <thead className="table-dark">
                      <tr>
                        <th>Year</th><th>Registration No.</th><th>Student Name</th>
                        <th>Exam Qualified</th><th className="text-center">Evidence</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr><td colSpan={6} className="text-center text-muted py-4">No records found.</td></tr>
                      ) : records.map(row => (
                        <tr key={row.id}>
                          <td>{row.year}</td><td>{row.registration_no}</td>
                          <td>{row.student_name}</td><td>{row.exam_qualified}</td>
                          <td className="text-center">
                            {row.pdf_path && <a href={row.pdf_path} target="_blank" rel="noreferrer"><i className="bi bi-file-pdf text-danger"></i></a>}
                          </td>
                          <td className="text-center">
                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}><i className="bi bi-trash"></i></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
