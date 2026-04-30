// ============================================================
// Criterion1_1_3.jsx — 1.1.3 Teacher Participation
// Teacher dropdown loaded from API (not hardcoded)
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getTeachers, getRecords, addRecord, deleteRecord, updateRecord, getExcelExportUrl } from "../../api/apiService";

export default function Criterion1_1_3() {
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [records, setRecords]   = useState([]);
  const [alert, setAlert]       = useState(null);
  const [editRecord, setEditRecord] = useState(null);

  // Multi-row form state
  const [rows, setRows] = useState([
    { year: "", teacherName: "", bodyName: "", document: null }
  ]);

  useEffect(() => {
    Promise.all([
      getTeachers(), 
      getRecords("1_1_3"),
      import("../../api/apiService").then(m => m.getAcademicYears())
    ]).then(([t, r, years]) => {
      setTeachers(t);
      setRecords(r);
      setAcademicYears(years);
    });
  }, []);

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => setRows([...rows, { year: "", teacherName: "", bodyName: "", document: null }]);

  const removeRow = (index) => {
    if (rows.length > 1) setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const row of rows) {
      if (!row.teacherName || !row.year || !row.bodyName) {
        return showAlert("Please fill all fields in every row.", "warning");
      }
      const result = await addRecord("1_1_3", {
        year: row.year,
        teacherName: row.teacherName,
        bodyName: row.bodyName,
        documentPath: row.document ? row.document.name : null,
      });
      if (result.success) setRecords(prev => [...prev, result.data]);
    }
    setRows([{ year: "", teacherName: "", bodyName: "", document: null }]);
    showAlert("Records saved successfully!", "success");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await deleteRecord("1_1_3", id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await updateRecord("1_1_3", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Record updated!", "success");
  };

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="1_1_3" />
      <div className="main-content">
        <header className="page-header">
          <h4>Criteria 1.1.3: Teacher Participation</h4>
          <div className="d-flex gap-2">
            <button className="btn btn-success btn-sm" onClick={() => window.open(getExcelExportUrl("1_1_3"), "_blank")}>
              <i className="bi bi-file-earmark-excel me-1"></i> Excel Export
            </button>
          </div>
        </header>

        <div className="container-fluid p-4">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
              {alert.msg}
              <button className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          {/* ---- ADD FORM ---- */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {rows.map((row, idx) => (
                  <div className="row g-3 mb-3 pb-3 border-bottom align-items-end" key={idx}>
                    <div className="col-md-2">
                      <label className="form-label-custom">Year</label>
                      <select
                        className="form-select form-select-sm"
                        value={row.year}
                        onChange={e => updateRow(idx, "year", e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Year</option>
                        {academicYears.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label-custom">Name of Teacher Participated</label>
                      {/* ✅ Dropdown from API — not hardcoded */}
                      <select
                        className="form-select form-select-sm"
                        value={row.teacherName}
                        onChange={e => updateRow(idx, "teacherName", e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Teacher</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label-custom">Name of the Body</label>
                      <input
                        type="text" className="form-control form-control-sm"
                        placeholder="e.g. BOS/Paper Setter" value={row.bodyName}
                        onChange={e => updateRow(idx, "bodyName", e.target.value)} required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label-custom">Proof Document</label>
                      <input
                        type="file" className="form-control form-control-sm" accept=".pdf"
                        onChange={e => updateRow(idx, "document", e.target.files[0])}
                      />
                    </div>

                    <div className="col-md-1">
                      <button
                        type="button" className="btn btn-sm btn-outline-danger w-100"
                        onClick={() => removeRow(idx)}
                      >×</button>
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={addRow}>
                    + Add Another Teacher
                  </button>
                  <button type="submit" className="btn btn-danger px-5 fw-bold">
                    Save All Records
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ---- TABLE ---- */}
          <div className="table-responsive bg-white shadow-sm p-3 rounded">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Year</th>
                  <th>Name of Teacher Participated</th>
                  <th>Name of the Body</th>
                  <th className="text-center">Proof Document</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      <i className="bi bi-folder-x" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }}></i>
                      No records yet.
                    </td>
                  </tr>
                ) : records.map(row => (
                  <tr key={row.id}>
                    <td>{row.year}</td>
                    <td>{row.teacherName}</td>
                    <td>{row.bodyName}</td>
                    <td className="text-center">
                      {row.documentPath && (
                        <button className="btn btn-sm btn-outline-primary rounded-pill px-3">View PDF</button>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setEditRecord({ ...row })}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(row.id)}
                        >
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

        {/* ---- EDIT MODAL ---- */}
        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Edit Teacher Participation</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Year</label>
                    <input
                      type="text" className="form-control"
                      value={editRecord.year || ""}
                      onChange={e => setEditRecord({ ...editRecord, year: e.target.value })} required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Teacher Name</label>
                    <select
                      className="form-select"
                      value={editRecord.teacherName || ""}
                      onChange={e => setEditRecord({ ...editRecord, teacherName: e.target.value })} required
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Body Name / Activity</label>
                    <input
                      type="text" className="form-control"
                      value={editRecord.bodyName || ""}
                      onChange={e => setEditRecord({ ...editRecord, bodyName: e.target.value })} required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Update Proof (Optional)</label>
                    <input type="file" className="form-control" accept=".pdf" />
                    <small className="text-muted">Leave blank to keep existing file.</small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
                  <button type="submit" className="btn btn-success">Save Changes</button>
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
