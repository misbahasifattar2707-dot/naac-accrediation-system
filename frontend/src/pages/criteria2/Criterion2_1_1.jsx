// ============================================================
// Criterion2_1_1.jsx — 2.1.1 Enrolment Number
// Programme dropdown fetched from apiService — no hardcoding
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import {
  getProgrammes, getRecords, addRecord, deleteRecord, deleteRecordsBulk
} from "../../api/apiService";

const emptyRow = () => ({ programme_name: "", programme_code: "", seats_sanctioned: "", students_admitted: "" });

export default function Criterion2_1_1() {
  const navigate = useNavigate();
  const [programmeOptions, setProgrammeOptions] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [rows, setRows] = useState([emptyRow()]);
  const [records, setRecords] = useState([]);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    Promise.all([getProgrammes(), getRecords("2_1_1")])
      .then(([progs, recs]) => { setProgrammeOptions(progs); setRecords(recs); })
      .finally(() => setLoadingDropdowns(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => rows.length > 1 && setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  // When a programme is selected, auto-fill the code
  const handleProgrammeChange = (i, name) => {
    const prog = programmeOptions.find(p => p.name === name);
    const updated = [...rows];
    updated[i] = { ...updated[i], programme_name: name, programme_code: prog ? prog.code : "" };
    setRows(updated);
  };

  const handleSave = async () => {
    for (const r of rows) {
      if (!r.programme_name || !r.seats_sanctioned || !r.students_admitted) {
        return showAlert("Fill all required fields.", "danger");
      }
      const result = await addRecord("2_1_1", r);
      if (result.success) setRecords(prev => [...prev, result.data]);
    }
    setRows([emptyRow()]);
    showAlert("Records saved successfully!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_1_1", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };



  return (
    <div className="app-layout">
      <Sidebar activePage="2_1_1" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.1.1: Enrolment Number</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => navigate("/export/2-1-1")}>
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
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Programme Records
              </h6>

              {loadingDropdowns ? (
                <div className="spinner-overlay"><div className="spinner-border text-danger"></div></div>
              ) : (
                <>
                  <div className="row g-2 mb-1 d-none d-md-flex">
                    {["Programme Name", "Programme Code", "Seats Sanctioned", "Students Admitted", ""].map((h, i) => (
                      <div key={i} className={i === 0 ? "col-md-4" : i === 4 ? "col-md-1" : "col-md-2"}>
                        <span className="form-label-custom">{h}</span>
                      </div>
                    ))}
                  </div>

                  {rows.map((row, i) => (
                    <div key={i} className="row g-2 mb-2 align-items-center">
                      <div className="col-md-4">
                        <select className="form-select form-select-sm" value={row.programme_name}
                          onChange={e => handleProgrammeChange(i, e.target.value)}>
                          <option value="">Select Programme</option>
                          {programmeOptions.map(p => (
                            <option key={p.code} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-2">
                        <input className="form-control form-control-sm" placeholder="Code"
                          value={row.programme_code}
                          onChange={e => updateRow(i, "programme_code", e.target.value)} />
                      </div>
                      <div className="col-md-2">
                        <input type="number" className="form-control form-control-sm" placeholder="Seats"
                          value={row.seats_sanctioned} onChange={e => updateRow(i, "seats_sanctioned", e.target.value)} />
                      </div>
                      <div className="col-md-3">
                        <input className="form-control form-control-sm" placeholder="e.g. 60+3"
                          value={row.students_admitted} onChange={e => updateRow(i, "students_admitted", e.target.value)} />
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


          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>

                    <th>Programme Name</th>
                    <th>Programme Code</th>
                    <th>Seats Sanctioned</th>
                    <th>Students Admitted</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>

                      <td className="fw-semibold">{row.programme_name}</td>
                      <td><span className="badge bg-secondary">{row.programme_code}</span></td>
                      <td>{row.seats_sanctioned}</td>
                      <td>{row.students_admitted}</td>
                      <td className="text-center">
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(row.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
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
    </div>
  );
}
