// ============================================================
// Criterion5_3_3.jsx — 5.3.3: Sports & Cultural Events Organized
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, deleteRecord, getAcademicYears } from "../../api/apiService";

const emptyForm = () => ({ year: "", event_date: "", event_name: "" });

export default function Criterion5_3_3() {
  const [form, setForm]           = useState(emptyForm());
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [alert, setAlert]         = useState(null);
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    Promise.all([getRecords("5_3_3"), getAcademicYears()])
      .then(([recs, years]) => { setRecords(recs); setYearOptions(years); })
      .finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleSave = async () => {
    if (!form.year || !form.event_date || !form.event_name)
      return showAlert("All fields are required.", "danger");
    const result = await addRecord("5_3_3", form);
    if (result.success) {
      setRecords(prev => [...prev, result.data]);
      setForm(emptyForm());
      showAlert("Event added!");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    await deleteRecord("5_3_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Event deleted.");
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="5_3_3" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 5</p>
            <h4>5.3.3: Average Number of Sports & Cultural Events Organized</h4>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-success btn-sm fw-semibold">
              <i className="bi bi-file-earmark-excel me-1"></i> Export Excel
            </button>
          </div>
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
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Event
              </h6>
              <div className="row g-3">
                <div className="col-md-2">
                  <label className="form-label fw-bold small text-muted">Year</label>
                  <select className="form-select" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })}>
                    <option value="">Select Year</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold small text-muted">Date of Event</label>
                  <input type="text" className="form-control" placeholder="DD-MM-YYYY"
                    value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} />
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-bold small text-muted">Name of the Event</label>
                  <input type="text" className="form-control" placeholder="Enter event title"
                    value={form.event_name} onChange={e => setForm({ ...form, event_name: e.target.value })} />
                </div>
                <div className="col-md-2 mt-3 d-flex align-items-end">
                  <button className="btn btn-danger w-100 fw-bold" onClick={handleSave}>Add Event</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
            <div className="card-body p-3">
              {loading ? <div className="text-center py-4"><div className="spinner-border text-danger"></div></div> : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: "15%" }}>Year</th>
                        <th style={{ width: "20%" }}>Date of Event</th>
                        <th>Name of the Event</th>
                        <th className="text-center" style={{ width: "10%" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-4 text-muted">No records found. Add an event to get started.</td></tr>
                      ) : records.map(row => (
                        <tr key={row.id}>
                          <td className="fw-bold">{row.year}</td>
                          <td>{row.event_date}</td>
                          <td>{row.event_name}</td>
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
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
