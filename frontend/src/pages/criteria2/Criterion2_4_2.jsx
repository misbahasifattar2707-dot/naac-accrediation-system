// ============================================================
// Criterion2_4_2.jsx — 2.4.2 Teachers with Ph.D./NET/SET
// Qualification dropdown fetched from backend
// ============================================================
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, updateRecord, deleteRecord } from "../../api/apiService";

const emptyForm = () => ({ teacher_name: "", qualification: "", obtaining_year: "" });

export default function Criterion2_4_2() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm());
  const [records, setRecords] = useState([]);
  const [editRecord, setEditRecord] = useState(null);
  const [qualificationOptions, setQualificationOptions] = useState([]);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRecords("2_4_2"),
      getRecords("2_4_2_qualification_options"),
    ]).then(([recs, opts]) => {
      setRecords(recs);
      // Use backend options if available; else use default qualification list
      setQualificationOptions(
        opts && opts.length > 0
          ? opts.map(o => (typeof o === "string" ? o : o.value || o.label))
          : ["Ph.D.", "NET", "SET", "SLET"]
      );
    }).finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleChange = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSave = async () => {
    const { teacher_name, qualification, obtaining_year } = form;
    if (!teacher_name || !qualification || !obtaining_year) {
      return showAlert("Please fill all fields.", "danger");
    }
    const result = await addRecord("2_4_2", form);
    if (result.success) {
      setRecords(prev => [...prev, result.data]);
      setForm(emptyForm());
      showAlert("Qualification record saved!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("2_4_2", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };

  const handleEditSave = async () => {
    await updateRecord("2_4_2", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Record updated!");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="2_4_2" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 2</p>
            <h4>2.4.2: Teachers with Ph.D. / NET / SET</h4>
          </div>
          <button className="btn btn-success btn-sm fw-semibold" onClick={() => navigate("/export/2-4-2")}>
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
                <i className="bi bi-award me-2 text-danger"></i>Add Teacher Qualification Record
              </h6>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-danger"></div></div>
              ) : (
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label className="form-label-custom">Name of Full-time Teacher</label>
                    <input type="text" className="form-control" placeholder="Enter teacher name"
                      value={form.teacher_name} onChange={e => handleChange("teacher_name", e.target.value)} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Qualification</label>
                    <select className="form-select" value={form.qualification} onChange={e => handleChange("qualification", e.target.value)}>
                      <option value="">Select Qualification</option>
                      {qualificationOptions.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Year of Obtaining</label>
                    <input type="text" className="form-control" placeholder="e.g. 2021"
                      value={form.obtaining_year} onChange={e => handleChange("obtaining_year", e.target.value)} />
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-danger w-100 fw-bold" onClick={handleSave}>
                      <i className="bi bi-plus-circle me-1"></i> Add Record
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
                    <th>Teacher Name</th>
                    <th>Qualification</th>
                    <th>Year of Obtaining</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-muted py-5">No records yet.</td></tr>
                  ) : records.map(row => (
                    <tr key={row.id}>
                      <td className="fw-semibold">{row.teacher_name}</td>
                      <td>
                        <span className="badge bg-info text-dark fw-semibold">{row.qualification}</span>
                      </td>
                      <td>{row.obtaining_year}</td>
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 14 }}>
              <div className="modal-header" style={{ background: "#b31d1d", color: "white", borderRadius: "14px 14px 0 0" }}>
                <h5 className="modal-title fw-bold">Edit Qualification: {editRecord.teacher_name}</h5>
                <button className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label-custom">Qualification</label>
                  <select className="form-select" value={editRecord.qualification}
                    onChange={e => setEditRecord({ ...editRecord, qualification: e.target.value })}>
                    {qualificationOptions.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label-custom">Year of Obtaining</label>
                  <input type="text" className="form-control" value={editRecord.obtaining_year}
                    onChange={e => setEditRecord({ ...editRecord, obtaining_year: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer bg-light" style={{ borderRadius: "0 0 14px 14px" }}>
                <button className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
                <button className="btn btn-danger fw-bold px-4" onClick={handleEditSave}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
