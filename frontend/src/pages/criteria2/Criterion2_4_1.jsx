// ============================================================
// Criterion2_4_1.jsx — 2.4.1 List of Full-time Teachers
// All dropdowns (nature of appointment) fetched from backend
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, updateRecord, deleteRecord } from "../../api/apiService";

const emptyForm = () => ({ name: "", pan: "", designation: "", year: "", nature: "", experience: "" });

export default function Criterion2_4_1() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [natureOptions, setNatureOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRecords("2_4_1"),
      getRecords("2_4_1_nature_options"),
    ]).then(([recs, opts]) => {
      setRecords(recs);
      // If backend provides nature options, use them; else fallback
      setNatureOptions(
        opts && opts.length > 0
          ? opts.map(o => (typeof o === "string" ? o : o.value || o.label))
          : ["Regular", "Temporary", "Permanent"]
      );
    }).finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    const { name, pan, designation, year, nature, experience } = form;
    if (!name || !pan || !designation || !year || !nature || !experience) {
      return showAlert("Please fill all fields.", "danger");
    }
    const result = await addRecord("2_4_1", { ...form, experience: parseFloat(experience) });
    if (result.success) {
      setRecords(prev => [...prev, result.data]);
      setForm(emptyForm());
      showAlert("Teacher record saved!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_4_1", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    await updateRecord("2_4_1", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Record updated!");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="2_4_1" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.4.1: List of Full-time Teachers</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => navigate("/export/2-4-1")}>
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

          {/* Add Form */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: "0.78rem", letterSpacing: 1, color: "#888" }}>
                <i className="bi bi-person-plus me-2 text-danger"></i>Add Full-time Teacher
              </h6>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
              ) : (
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label-custom">Name of Teacher</label>
                    <input type="text" className="form-control" placeholder="Full name"
                      value={form.name} onChange={e => handleChange("name", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">PAN</label>
                    <input type="text" className="form-control" placeholder="ABCDE1234F"
                      value={form.pan} onChange={e => handleChange("pan", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Designation</label>
                    <input type="text" className="form-control" placeholder="Assistant Professor"
                      value={form.designation} onChange={e => handleChange("designation", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Appointment Year</label>
                    <input type="number" className="form-control" placeholder="2024"
                      value={form.year} onChange={e => handleChange("year", e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Nature of Appointment</label>
                    <select className="form-select" value={form.nature} onChange={e => handleChange("nature", e.target.value)}>
                      <option value="">Select Nature</option>
                      {natureOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Experience (Yrs)</label>
                    <input type="number" step="0.1" className="form-control" placeholder="0.0"
                      value={form.experience} onChange={e => handleChange("experience", e.target.value)} />
                  </div>
                  <div className="col-12 text-end">
                    <button className="btn btn-danger px-5 fw-bold" onClick={handleSave}>
                      <i className="bi bi-save me-1"></i> Save Teacher Record
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden" }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>Name</th>
                    <th>PAN</th>
                    <th>Designation</th>
                    <th>Year</th>
                    <th>Nature</th>
                    <th>Exp.</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.name}</td>
                      <td className="text-muted small">{row.pan}</td>
                      <td>{row.designation}</td>
                      <td>{row.year}</td>
                      <td>
                        <span className="badge" style={{ background: "#fee2e2", color: "#b31d1d", fontWeight: 700, fontSize: "0.75rem" }}>
                          {row.nature}
                        </span>
                      </td>
                      <td>{row.experience}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button className="btn btn-outline-primary" onClick={() => setEditRecord({ ...row })}>
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button className="btn btn-outline-danger" onClick={() => handleDelete(row.id)}>
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Teacher: {editRecord.name}</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label-custom">Designation</label>
                    <input type="text" className="form-control" value={editRecord.designation}
                      onChange={e => setEditRecord({ ...editRecord, designation: e.target.value })} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Nature of Appointment</label>
                    <select className="form-select" value={editRecord.nature}
                      onChange={e => setEditRecord({ ...editRecord, nature: e.target.value })}>
                      {natureOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label-custom">Experience (Yrs)</label>
                    <input type="number" step="0.1" className="form-control" value={editRecord.experience}
                      onChange={e => setEditRecord({ ...editRecord, experience: parseFloat(e.target.value) })} />
                  </div>
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
