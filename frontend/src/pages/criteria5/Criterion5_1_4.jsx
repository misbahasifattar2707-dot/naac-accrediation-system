// ============================================================
// Criterion5_1_4.jsx — 5.1.4: Competitive Exams & Career Counseling
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, deleteRecord, deleteRecordsBulk, getAcademicYears } from "../../api/apiService";

const emptyForm = () => ({
  year: "", exam_activity: "", exam_participants: "",
  counseling_activity: "", counseling_participants: "",
  placements: "", doc_link: "", document: null
});

export default function Criterion5_1_4() {
  const [rows, setRows]           = useState([emptyForm()]);
  const [records, setRecords]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [alert, setAlert]         = useState(null);
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    Promise.all([getRecords("5_1_4"), getAcademicYears()])
      .then(([recs, years]) => { setRecords(recs); setYearOptions(years); })
      .finally(() => setLoading(false));
  }, []);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const updateRow = (idx, field, val) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  };

  const addRow = () => setRows(prev => [...prev, emptyForm()]);
  const removeRow = (idx) => setRows(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    const valid = rows.filter(r => r.year);
    if (!valid.length) return showAlert("Year is required.", "danger");
    for (const row of valid) {
      const result = await addRecord("5_1_4", {
        year: row.year, exam_activity: row.exam_activity,
        exam_participants: row.exam_participants,
        counseling_activity: row.counseling_activity,
        counseling_participants: row.counseling_participants,
        placements: row.placements, doc_link: row.doc_link
      });
      if (result.success) setRecords(prev => [...prev, result.data]);
    }
    setRows([emptyForm()]);
    showAlert(`${valid.length} record(s) saved!`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("5_1_4", id);
    setRecords(prev => prev.filter(r => r.id !== id));
    showAlert("Record deleted.");
  };



  return (
    <div className="app-layout">
      <Sidebar activePage="5_1_4" />
      <div className="main-content">
        <header className="page-header">
          <div>
            <p className="text-muted mb-0" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: 1 }}>Criteria 5</p>
            <h4>5.1.4: Competitive Exams & Career Counseling</h4>
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
                <i className="bi bi-plus-circle me-2 text-danger"></i>Add Records
              </h6>
              {rows.map((row, idx) => (
                <div key={idx} className="p-3 border rounded bg-light mb-3">
                  <div className="row g-2 align-items-end">
                    <div className="col-md-2">
                      <label className="form-label-custom">Year</label>
                      <select className="form-select form-select-sm" value={row.year} onChange={e => updateRow(idx, "year", e.target.value)}>
                        <option value="">Select Year</option>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Competitive Exam Activity</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Name of Activity"
                        value={row.exam_activity} onChange={e => updateRow(idx, "exam_activity", e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Exam Participants</label>
                      <input type="number" className="form-control form-control-sm" placeholder="0"
                        value={row.exam_participants} onChange={e => updateRow(idx, "exam_participants", e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Counseling Activity</label>
                      <input type="text" className="form-control form-control-sm" placeholder="Name of Activity"
                        value={row.counseling_activity} onChange={e => updateRow(idx, "counseling_activity", e.target.value)} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Counseling Participants</label>
                      <input type="number" className="form-control form-control-sm" placeholder="0"
                        value={row.counseling_participants} onChange={e => updateRow(idx, "counseling_participants", e.target.value)} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Campus Placements</label>
                      <input type="number" className="form-control form-control-sm" placeholder="No. of Students"
                        value={row.placements} onChange={e => updateRow(idx, "placements", e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Evidence (PDF)</label>
                      <input type="file" className="form-control form-control-sm" accept=".pdf"
                        onChange={e => updateRow(idx, "document", e.target.files[0])} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label-custom">Doc Link</label>
                      <input type="url" className="form-control form-control-sm" placeholder="https://..."
                        value={row.doc_link} onChange={e => updateRow(idx, "doc_link", e.target.value)} />
                    </div>
                    <div className="col-md-1 d-flex align-items-end">
                      <button className="btn btn-sm btn-outline-danger w-100" onClick={() => removeRow(idx)}>×</button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button className="btn btn-sm btn-outline-primary" onClick={addRow}>+ Add More Rows</button>
                <button className="btn btn-danger px-5" onClick={handleSave}>Save All Records</button>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm" style={{ borderRadius: 14 }}>
            <div className="card-body p-4">
              {loading ? <div className="text-center py-4"><div className="spinner-border text-danger"></div></div> : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle small">
                    <thead className="table-dark">
                      <tr>
                        <th>Year</th>
                        <th>Competitive Exam (Activity/Qty)</th>
                        <th>Counseling (Activity/Qty)</th>
                        <th>Placements</th>
                        <th className="text-center">Evidence</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.length === 0 ? (
                        <tr><td colSpan={6} className="text-center text-muted py-4">No records found.</td></tr>
                      ) : records.map(row => (
                        <tr key={row.id}>
                          <td>{row.year}</td>
                          <td>{row.exam_activity} ({row.exam_participants})</td>
                          <td>{row.counseling_activity} ({row.counseling_participants})</td>
                          <td>{row.placements}</td>
                          <td className="text-center">
                            {row.pdf_path && <a href={row.pdf_path} target="_blank" rel="noreferrer" className="text-danger me-2"><i className="bi bi-file-earmark-pdf fs-5"></i></a>}
                            {row.doc_link && <a href={row.doc_link} target="_blank" rel="noreferrer" className="text-primary"><i className="bi bi-link-45deg fs-5"></i></a>}
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
