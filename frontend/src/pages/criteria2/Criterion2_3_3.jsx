// ============================================================
// Criterion2_3_3.jsx — 2.3.3 Mentor-Mentee Ratio
// Branch-wise student counts; mentor count fetched/stored separately
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, deleteRecord, deleteRecordsBulk } from "../../api/apiService";

const emptyRow = () => ({ branch: "", first: "", second: "", third: "", fourth: "" });

export default function Criterion2_3_3() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([emptyRow()]);
  const [records, setRecords] = useState([]);
  const [mentorCount, setMentorCount] = useState(1);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRecords("2_3_3"),
      getRecords("2_3_3_meta"),
    ]).then(([recs, meta]) => {
      setRecords(recs);
      if (meta && meta[0]) setMentorCount(meta[0].mentor_count || 1);
    }).finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const addRow = () => setRows([...rows, emptyRow()]);
  const removeRow = (i) => rows.length > 1 && setRows(rows.filter((_, idx) => idx !== i));
  const updateRow = (i, field, val) =>
    setRows(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  const handleSave = async () => {
    for (const r of rows) {
      if (!r.branch.trim()) return showAlert("Branch name is required for every row.", "danger");
      const data = {
        branch: r.branch,
        first: parseInt(r.first) || 0,
        second: parseInt(r.second) || 0,
        third: parseInt(r.third) || 0,
        fourth: parseInt(r.fourth) || 0,
      };
      data.total = data.first + data.second + data.third + data.fourth;
      const result = await addRecord("2_3_3", data);
      if (result.success) setRecords(prev => [...prev, result.data]);
    }
    setRows([emptyRow()]);
    showAlert("Records saved successfully!");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_3_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };



  const totalStudents = records.reduce((sum, r) => sum + (r.total || 0), 0);
  const ratio = mentorCount > 0 ? Math.round(totalStudents / mentorCount) : 0;

  return (
    <div className="app-layout">
      <Sidebar activePage="2_3_3" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.3.3: Mentor-Mentee Ratio</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => navigate("/export/2-3-3")}>
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

          {/* Add Records Card */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Branch-wise Student Records
              </h6>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
              ) : (
                <>
                  <div className="row g-2 mb-1 d-none d-md-flex text-muted" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    <div className="col-md-3">Branch Name</div>
                    <div className="col-md-2">First Year</div>
                    <div className="col-md-2">Second Year</div>
                    <div className="col-md-2">Third Year</div>
                    <div className="col-md-2">Fourth Year</div>
                    <div className="col-md-1"></div>
                  </div>

                  {rows.map((row, i) => (
                    <div key={i} className="row g-2 mb-2 align-items-center">
                      <div className="col-md-3">
                        <input type="text" className="form-control form-control-sm" placeholder="e.g. MCA"
                          value={row.branch} onChange={e => updateRow(i, "branch", e.target.value)} />
                      </div>
                      {["first", "second", "third", "fourth"].map(field => (
                        <div key={field} className="col-md-2">
                          <input type="number" className="form-control form-control-sm" placeholder="0" min="0"
                            value={row[field]} onChange={e => updateRow(i, field, e.target.value)} />
                        </div>
                      ))}
                      <div className="col-md-1">
                        <button className="btn btn-outline-danger btn-sm w-100" onClick={() => removeRow(i)}>×</button>
                      </div>
                    </div>
                  ))}

                  <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                    <button className="btn btn-outline-primary btn-sm" onClick={addRow}>
                      <i className="bi bi-plus-lg me-1"></i> Add More
                    </button>
                    <button className="btn btn-danger px-4 fw-bold" onClick={handleSave}>
                      <i className="bi bi-save me-1"></i> Save Records
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bulk select + delete */}

          {/* Records Table */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>

                    <th>Branch</th>
                    <th>First</th>
                    <th>Second</th>
                    <th>Third</th>
                    <th>Fourth</th>
                    <th>Total</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>

                      <td className="fw-semibold">{row.branch}</td>
                      <td>{row.first}</td>
                      <td>{row.second}</td>
                      <td>{row.third}</td>
                      <td>{row.fourth}</td>
                      <td><span className="fw-bold text-danger">{row.total}</span></td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mentor Calculation Summary */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
            <div className="card-header bg-white border-bottom" style={{ borderRadius: "14px 14px 0 0" }}>
              <h6 className="mb-0 fw-bold text-danger">
                <i className="bi bi-calculator me-2"></i>Mentor Calculation & Summary
              </h6>
            </div>
            <div className="card-body p-4">
              <div className="row align-items-end g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label-custom">Total Students (Auto)</label>
                  <input type="number" className="form-control bg-light fw-bold" value={totalStudents} readOnly />
                </div>
                <div className="col-md-3">
                  <label className="form-label-custom">No. of Mentors</label>
                  <input type="number" className="form-control" min="1"
                    value={mentorCount} onChange={e => setMentorCount(parseInt(e.target.value) || 1)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label-custom">Calculated Ratio</label>
                  <div className="form-control bg-light fw-bold text-primary">1:{ratio}</div>
                </div>
              </div>

              <hr className="my-3" />

              <div className="row justify-content-center">
                <div className="col-md-6">
                  <table className="table table-bordered text-center align-middle shadow-sm mb-0">
                    <thead className="table-light">
                      <tr><th colSpan={2} className="fw-bold py-2">Academic Year: 2024-25</th></tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="fw-bold bg-light" style={{ width: "50%" }}>No. of Students</td>
                        <td>{totalStudents}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">No. of Mentors</td>
                        <td>{mentorCount}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold bg-light">Mentor/Mentee Ratio</td>
                        <td className="text-danger fw-bold">01:{ratio}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
