// ============================================================
// Criterion2_1.jsx — 2.1 Number of Students During the Year
// Dropdowns (academic year) fetched from apiService — no hardcoding
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import {
  getAcademicYears, getRecords, addRecord, updateRecord,
  deleteRecord, deleteRecordsBulk
} from "../../api/apiService";

const emptyRow = () => ({ enrollment_year: "", student_name: "", enrollment_number: "", enrollment_date: "" });

export default function Criterion2_1() {
  const navigate = useNavigate();

  // ---- Dropdown options (from API) ----
  const [yearOptions, setYearOptions] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // ---- Form rows ----
  const [rows, setRows] = useState([emptyRow()]);

  // ---- Records ----
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert] = useState(null);

  // ---- Load dropdowns + existing records on mount ----
  useEffect(() => {
    Promise.all([getAcademicYears(), getRecords("2_1")])
      .then(([years, recs]) => {
        setYearOptions(years);
        setRecords(recs);
      })
      .finally(() => setLoadingDropdowns(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  // ---- Row management ----
  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => rows.length > 1 && setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  // ---- Save ----
  const handleSave = async () => {
    for (const r of rows) {
      if (!r.enrollment_year || !r.student_name || !r.enrollment_number || !r.enrollment_date) {
        return showAlert("Please fill all fields in every row.", "danger");
      }
      const result = await addRecord("2_1", r);
      if (result.success) setRecords(prev => [...prev, result.data]);
    }
    setRows([emptyRow()]);
    showAlert("Student records saved successfully!");
  };

  // ---- Delete single ----
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_1", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };


  // ---- Edit ----
  const handleEditSave = async () => {
    await updateRecord("2_1", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Record updated!");
  };


  return (
    <div className="app-layout">
      <Sidebar activePage="2_1" />

      <div className="main-content">
        {/* Page Header */}
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.1: Number of Students During the Year</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => navigate("/export/2-1")}>
            <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
          </button>
        </header>

        <div className="container-fluid p-4 fade-in">

          {/* Alert */}
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible d-flex align-items-center gap-2 shadow-sm`} style={{ borderRadius: 10 }}>
              <i className={`bi ${alert.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`}></i>
              {alert.msg}
              <button type="button" className="btn-close ms-auto" onClick={() => setAlert(null)}></button>
            </div>
          )}

          {/* Add Form Card */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Student Records
              </h6>

              {loadingDropdowns ? (
                <div className="spinner-overlay"><div className="spinner-border text-danger" role="status"></div></div>
              ) : (
                <>
                  {/* Column headers */}
                  <div className="row g-2 mb-1 d-none d-md-flex">
                    {["Year of Enrollment", "Student Name", "Enrollment Number", "Date of Enrollment", ""].map((h, i) => (
                      <div key={i} className={i === 1 ? "col-md-3" : i === 4 ? "col-md-1" : "col-md-2"}>
                        <span className="form-label-custom">{h}</span>
                      </div>
                    ))}
                  </div>

                  {rows.map((row, i) => (
                    <div key={i} className="row g-2 mb-2 align-items-center">
                      <div className="col-md-2">
                        <select className="form-select form-select-sm" value={row.enrollment_year}
                          onChange={e => updateRow(i, "enrollment_year", e.target.value)}>
                          <option value="">Select Year</option>
                          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="col-md-3">
                        <input type="text" className="form-control form-control-sm" placeholder="Full Name"
                          value={row.student_name} onChange={e => updateRow(i, "student_name", e.target.value)} />
                      </div>
                      <div className="col-md-3">
                        <input type="text" className="form-control form-control-sm" placeholder="Enrollment ID"
                          value={row.enrollment_number} onChange={e => updateRow(i, "enrollment_number", e.target.value)} />
                      </div>
                      <div className="col-md-3">
                        <input type="date" className="form-control form-control-sm"
                          value={row.enrollment_date} onChange={e => updateRow(i, "enrollment_date", e.target.value)} />
                      </div>
                      <div className="col-md-1">
                        <button className="btn btn-outline-danger btn-sm w-100" onClick={() => removeRow(i)}>×</button>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <button className="btn btn-outline-primary btn-sm" onClick={addRow}>
                      <i className="bi bi-plus-lg me-1"></i> Add Row
                    </button>
                    <button className="btn btn-danger px-4 fw-bold" onClick={handleSave}>
                      <i className="bi bi-save me-1"></i> Save Records
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>


          {/* Records Table */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>

                    <th>Year</th>
                    <th>Student Name</th>
                    <th>Enrollment Number</th>
                    <th>Date of Enrollment</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-5">No records yet. Add student data above.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>

                      <td><span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700, fontSize: "0.75rem" }}>{row.enrollment_year}</span></td>
                      <td className="fw-semibold">{row.student_name}</td>
                      <td className="text-muted small">{row.enrollment_number}</td>
                      <td className="text-muted small">{row.enrollment_date}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => setEditRecord({ ...row })} title="Edit">
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => handleDelete(row.id)} title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Footer />
      </div>

      {/* Edit Modal */}
      {editRecord && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Student Record</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label-custom">Year of Enrollment</label>
                  <select className="form-select" value={editRecord.enrollment_year}
                    onChange={e => setEditRecord({ ...editRecord, enrollment_year: e.target.value })}>
                    <option value="">Select Year</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Student Name</label>
                  <input className="form-control" value={editRecord.student_name}
                    onChange={e => setEditRecord({ ...editRecord, student_name: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Enrollment Number</label>
                  <input className="form-control" value={editRecord.enrollment_number}
                    onChange={e => setEditRecord({ ...editRecord, enrollment_number: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Date of Enrollment</label>
                  <input type="date" className="form-control" value={editRecord.enrollment_date}
                    onChange={e => setEditRecord({ ...editRecord, enrollment_date: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer bg-light" style={{ borderRadius: "0 0 14px 14px" }}>
                <button className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
                <button className="btn btn-danger fw-bold px-4" onClick={handleEditSave}>Update Record</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
