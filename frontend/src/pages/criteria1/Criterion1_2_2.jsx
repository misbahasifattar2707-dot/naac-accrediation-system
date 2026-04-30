// ============================================================
// Criterion1_2_2.jsx — 1.2.2 & 1.2.3 Add on / Certificate Programs
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getRecords, addRecord, deleteRecord, updateRecord, getExcelExportUrl, uploadEvidence } from "../../api/apiService";

const emptyForm = {
  programName: "", courseCode: "", yearOffering: "",
  timesOffered: 1, duration: "", studentsEnrolled: "", studentsCompleted: "", docLink: "", pdfPath: null
};

export default function Criterion1_2_2() {
  const [records, setRecords]       = useState([]);
  const [form, setForm]             = useState(emptyForm);
  const [editRecord, setEditRecord] = useState(null);
  const [alert, setAlert]           = useState(null);
  const [proofFiles, setProofFiles] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    getRecords("1_2_2").then(setRecords);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addRecord("1_2_2", { ...form });
    if (result.success) { setRecords(prev => [...prev, result.data]); setForm(emptyForm); }
    showAlert("Program added!", "success");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteRecord("1_2_2", id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await updateRecord("1_2_2", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Updated!", "success");
  };

  // Group records by year
  const grouped = records.reduce((acc, rec) => {
    const yr = rec.yearOffering || "Unknown";
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(rec);
    return acc;
  }, {});

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleProofUpload = async () => {
    if (!proofFiles || proofFiles.length === 0) return showAlert("Please select files first.", "warning");
    setUploadingProof(true);
    const res = await uploadEvidence("1_2_2", proofFiles);
    setUploadingProof(false);
    if (res.success) {
        setForm({ ...form, docLink: "http://localhost:5000" + res.link, pdfPath: res.link });
        showAlert("Proof files uploaded and combined into PDF successfully!", "success");
    } else {
        showAlert("Upload failed: " + res.error, "danger");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="1_2_2" />
      <div className="main-content">
        <header className="page-header">
          <h4>1.2.2 & 1.2.3 Add on / Certificate Programs</h4>
          <div className="d-flex gap-2">
            <button className="btn btn-success btn-sm" onClick={() => window.open(getExcelExportUrl("1_2_2"), "_blank")}>
              <i className="bi bi-file-earmark-excel me-1"></i> Excel Export
            </button>
          </div>
        </header>

        <div className="container-fluid p-4">
          {alert && <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
            {alert.msg}<button className="btn-close" onClick={() => setAlert(null)}></button>
          </div>}

          {/* Form */}
          <div className="card border-0 shadow-sm mb-5">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label-custom">Name of Add on / Certificate Program</label>
                    <input type="text" className="form-control" placeholder="e.g. Digital Marketing"
                      value={form.programName} onChange={e => setForm({ ...form, programName: e.target.value })} required />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Course Code</label>
                    <input type="text" className="form-control" placeholder="e.g. DM101"
                      value={form.courseCode} onChange={e => setForm({ ...form, courseCode: e.target.value })} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Year of Offering</label>
                    <select className="form-select" value={form.yearOffering} onChange={e => setForm({ ...form, yearOffering: e.target.value })} required>
                      <option value="" disabled>Select Year</option>
                      {["2022-23", "2023-24", "2024-25", "2025-26", "2026-27"].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Times Offered</label>
                    <input type="number" className="form-control"
                      value={form.timesOffered} onChange={e => setForm({ ...form, timesOffered: e.target.value })} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label-custom">Duration</label>
                    <select className="form-select" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required>
                      <option value="" disabled>Select Duration</option>
                      {[...Array(12)].map((_, i) => <option key={i} value={`${i + 1} Month${i===0?'':'s'}`}>{i + 1} Month{i===0?'':'s'}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Students Enrolled</label>
                    <input type="number" className="form-control"
                      value={form.studentsEnrolled} onChange={e => setForm({ ...form, studentsEnrolled: e.target.value })} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Students Completed</label>
                    <input type="number" className="form-control"
                      value={form.studentsCompleted} onChange={e => setForm({ ...form, studentsCompleted: e.target.value })} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label-custom">Document Link (URL)</label>
                    <input type="url" className="form-control" placeholder="Paste link or merge PDFs"
                      value={form.docLink} onChange={e => setForm({ ...form, docLink: e.target.value })} />
                  </div>
                  <div className="col-md-8">
                    <label className="form-label-custom" style={{ color: "#dc3545" }}>Upload Document (PDF)</label>
                    <div className="input-group">
                      <input type="file" className="form-control" multiple accept="image/*,.pdf"
                        onChange={e => setProofFiles(e.target.files)} />
                      <button type="button" className="btn btn-outline-danger" onClick={handleProofUpload} disabled={uploadingProof}>
                        {uploadingProof ? "Merging..." : "Merge & Get Link"}
                      </button>
                    </div>
                  </div>
                  <div className="col-12 text-end mt-3">
                    <button type="submit" className="btn btn-danger px-5 fw-bold">Add Program Record</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Grouped Tables */}
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder-x" style={{ fontSize: "3rem", display: "block", marginBottom: 8 }}></i>
              No records found. Add your first program above.
            </div>
          ) : Object.entries(grouped).sort().map(([year, yearRecords]) => (
            <div className="card mb-4 border-0 shadow-sm overflow-hidden" key={year}>
              <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
                <span><i className="bi bi-calendar3 me-2"></i> Academic Year: {year}</span>
                <span className="badge bg-dark">{yearRecords.length} Programs</span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Program Name</th><th>Code</th><th>Times Offered</th>
                      <th>Duration</th><th>Enrolled</th><th>Completed</th>
                      <th>Document</th><th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearRecords.map(rec => (
                      <tr key={rec.id}>
                        <td><strong>{rec.programName}</strong></td>
                        <td><code>{rec.courseCode}</code></td>
                        <td>{rec.timesOffered}</td>
                        <td>{rec.duration}</td>
                        <td><span className="badge bg-info text-dark">{rec.studentsEnrolled}</span></td>
                        <td><span className="badge bg-success">{rec.studentsCompleted}</span></td>
                        <td>
                          {rec.docLink || rec.pdfPath
                            ? <a href={rec.docLink || rec.pdfPath} target="_blank" className="btn btn-sm btn-outline-danger"><i className="bi bi-file-pdf"></i> View</a>
                            : <span className="text-muted small">No File</span>}
                        </td>
                        <td className="text-center">
                          <button className="btn btn-sm btn-outline-primary me-1" onClick={() => setEditRecord({ ...rec })}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(rec.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-lg">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-dark text-white">
                  <h5 className="modal-title">Edit Program Record</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Program Name</label>
                      <input type="text" className="form-control" value={editRecord.programName || ""}
                        onChange={e => setEditRecord({ ...editRecord, programName: e.target.value })} required />
                    </div>
                    {[
                      { label: "Course Code", field: "courseCode", col: 4 },
                      { label: "Year",        field: "yearOffering", col: 4 },
                      { label: "Times Offered", field: "timesOffered", col: 4 },
                      { label: "Duration",    field: "duration", col: 4 },
                      { label: "Enrolled",    field: "studentsEnrolled", col: 4 },
                      { label: "Completed",   field: "studentsCompleted", col: 4 },
                    ].map(({ label, field, col }) => (
                      <div className={`col-md-${col}`} key={field}>
                        <label className="form-label fw-bold">{label}</label>
                        <input type="text" className="form-control" value={editRecord[field] || ""}
                          onChange={e => setEditRecord({ ...editRecord, [field]: e.target.value })} />
                      </div>
                    ))}
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Update PDF Document (Optional)</label>
                      <input type="file" className="form-control" accept=".pdf" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>Close</button>
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
