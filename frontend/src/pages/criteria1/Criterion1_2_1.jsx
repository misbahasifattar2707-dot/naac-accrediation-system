// ============================================================
// Criterion1_2_1.jsx — 1.2.1 CBCS / Elective System
// Subject code dropdown loaded from API
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getDepartments, getElectiveSubjects, getRecords, addRecord, deleteRecord, updateRecord, getExcelExportUrl, uploadEvidence } from "../../api/apiService";

export default function Criterion1_2_1() {
  const [departments, setDepartments]   = useState([]);
  const [electives, setElectives]       = useState([]);
  const [records, setRecords]           = useState([]);
  const [alert, setAlert]               = useState(null);
  const [editRecord, setEditRecord]     = useState(null);

  // Form state
  const [selectedDept, setSelectedDept] = useState("");
  const [progCode, setProgCode]         = useState("");
  const [progName, setProgName]         = useState("");
  const [semester, setSemester]         = useState("");
  const [proofLink, setProofLink]       = useState("");
  const [proofFiles, setProofFiles]     = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const semesters = [
    { value: "Sem 1", label: "Sem 1" },
    { value: "Sem 2", label: "Sem 2" },
    { value: "Sem 3", label: "Sem 3" },
    { value: "Sem 4", label: "Sem 4" },
  ];

  // Multi-row form
  const [rows, setRows] = useState([
    { subjectCode: "", subjectName: "", yearIntro: "", cbcsStatus: "Yes", cbcsYear: "" }
  ]);

  useEffect(() => {
    Promise.all([getDepartments(), getElectiveSubjects(), getRecords("1_2_1")])
      .then(([depts, elec, recs]) => {
        setDepartments(depts);
        setElectives(elec);
        setRecords(recs);
      });
  }, []);

  const handleDeptChange = (code) => {
    setSelectedDept(code);
    const dept = departments.find(d => d.code === code);
    if (dept) { setProgCode(dept.programCode); setProgName(dept.programName); }
  };

  const handleSubjectCodeChange = (index, code) => {
    const elective = electives.find(e => e.code === code);
    const updated = [...rows];
    updated[index].subjectCode = code;
    updated[index].subjectName = elective ? elective.name : "";
    setRows(updated);
  };

  const updateRow = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => setRows([...rows, { subjectCode: "", subjectName: "", yearIntro: "", cbcsStatus: "Yes", cbcsYear: "" }]);

  const removeRow = (index) => {
    if (rows.length > 1) setRows(rows.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const row of rows) {
      const result = await addRecord("1_2_1", {
        department: selectedDept, programCode: progCode, programName: progName, semester,
        subjectCode: row.subjectCode, subjectName: row.subjectName,
        yearIntro: row.yearIntro, cbcsStatus: row.cbcsStatus, cbcsYear: row.cbcsYear,
      });
      if (result.success) setRecords(prev => [...prev, result.data]);
    }
    setRows([{ subjectCode: "", subjectName: "", yearIntro: "", cbcsStatus: "Yes", cbcsYear: "" }]);
    showAlert("Records saved!", "success");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;
    await deleteRecord("1_2_1", id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    await updateRecord("1_2_1", editRecord.id, editRecord);
    setRecords(prev => prev.map(r => r.id === editRecord.id ? editRecord : r));
    setEditRecord(null);
    showAlert("Updated!", "success");
  };

  const showAlert = (msg, type) => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const handleProofUpload = async () => {
    if (!proofFiles || proofFiles.length === 0) return showAlert("Please select files first.", "warning");
    setUploadingProof(true);
    const res = await uploadEvidence("1_2_1", proofFiles);
    setUploadingProof(false);
    if (res.success) {
        setProofLink("http://localhost:5000" + res.link);
        showAlert("Proof files uploaded and combined into PDF successfully!", "success");
    } else {
        showAlert("Upload failed: " + res.error, "danger");
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activePage="1_2_1" />
      <div className="main-content">
        <header className="page-header">
          <h4>Criteria 1.2.1: CBCS / Elective System</h4>
          <button className="btn btn-success btn-sm" onClick={() => window.open(getExcelExportUrl("1_2_1"), "_blank")}>
            <i className="bi bi-file-earmark-excel me-1"></i> Excel Export
          </button>
        </header>

        <div className="container-fluid p-4">
          {alert && (
            <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
              {alert.msg}<button className="btn-close" onClick={() => setAlert(null)}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* Header row */}
                <div className="row g-3 mb-4 border-bottom pb-4">
                  <div className="col-md-3">
                    <label className="form-label-custom">Department</label>
                    <select className="form-select" value={selectedDept} onChange={e => handleDeptChange(e.target.value)} required>
                      <option value="" disabled>Select Dept</option>
                      {departments.map(d => <option key={d.id} value={d.code}>{d.code}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Programme Code</label>
                    <input type="text" className="form-control bg-light" value={progCode} readOnly />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Programme Name</label>
                    <input type="text" className="form-control bg-light" value={progName} readOnly />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label-custom">Semester</label>
                    <select className="form-select" value={semester} onChange={e => setSemester(e.target.value)} required>
                      <option value="" disabled>Select Semester</option>
                      {semesters.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Subject rows */}
                {rows.map((row, idx) => (
                  <div className="row g-2 mb-3 align-items-end" key={idx}>
                    <div className="col-md-2">
                      <label className="form-label-custom">Subject Code</label>
                      <select
                        className="form-select form-select-sm"
                        value={row.subjectCode}
                        onChange={e => handleSubjectCodeChange(idx, e.target.value)} required
                      >
                        <option value="" disabled>Select Code</option>
                        {electives.map(e => <option key={e.code} value={e.code}>{e.code}</option>)}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label-custom">Subject Name</label>
                      <input type="text" className="form-control form-control-sm bg-light" value={row.subjectName} readOnly />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Year of Introduction</label>
                      <select
                        className="form-select form-select-sm"
                        value={row.yearIntro}
                        onChange={e => updateRow(idx, "yearIntro", e.target.value)} required
                      >
                        <option value="" disabled>Select Year</option>
                        {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Status of implementation</label>
                      <select
                        className="form-select form-select-sm"
                        value={row.cbcsStatus}
                        onChange={e => updateRow(idx, "cbcsStatus", e.target.value)}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label-custom">Year of implementation</label>
                      <select
                        className="form-select form-select-sm"
                        value={row.cbcsYear}
                        onChange={e => updateRow(idx, "cbcsYear", e.target.value)} required
                      >
                        <option value="" disabled>Select Year</option>
                        {[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026].map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-1">
                      <button type="button" className="btn btn-sm btn-outline-danger w-100" onClick={() => removeRow(idx)}>×</button>
                    </div>
                  </div>
                ))}

                <div className="d-flex justify-content-between mt-3">
                  <button type="button" className="btn btn-sm btn-outline-primary" onClick={addRow}>+ Add Row</button>
                  <button type="submit" className="btn btn-danger px-5 fw-bold">Save Records</button>
                </div>
              </form>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive bg-white shadow-sm p-3 rounded mb-4">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Subject Code</th><th>Subject Name</th><th>Year of Introduction</th>
                  <th>Status of implementation</th><th>Year of implementation</th><th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No records yet.</td></tr>
                ) : records.map(row => (
                  <tr key={row.id}>
                    <td><strong>{row.subjectCode}</strong></td>
                    <td>{row.subjectName}</td>
                    <td>{row.yearIntro}</td>
                    <td>
                      <span className={`badge ${row.cbcsStatus === "Yes" ? "bg-success" : "bg-secondary"}`}>
                        {row.cbcsStatus}
                      </span>
                    </td>
                    <td>{row.cbcsYear}</td>
                    <td className="text-center">
                      <div className="btn-group">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setEditRecord({ ...row })}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(row.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Proof Section */}
          <div className="mt-4 p-4 rounded proof-section shadow-sm bg-white border">
            <h5 className="fw-bold text-dark mb-1">Final Criteria Proof Submission</h5>
            <p className="text-muted small mb-4">Upload multiple images/PDFs to combine, or paste a Google Drive link.</p>
            
            <div className="mb-3">
              <label className="form-label fw-bold small">Upload Evidence Files</label>
              <div className="input-group">
                <input 
                  type="file" className="form-control" multiple 
                  onChange={e => setProofFiles(e.target.files)} 
                  accept="image/*,.pdf"
                />
                <button 
                  className="btn btn-primary" 
                  onClick={handleProofUpload}
                  disabled={uploadingProof}
                >
                  {uploadingProof ? "Uploading & Combining..." : "Upload & Combine PDF"}
                </button>
              </div>
            </div>

            <div className="input-group">
              <input
                type="url" className="form-control"
                placeholder="Or paste Google Drive PDF / Uploaded link here..."
                value={proofLink} onChange={e => setProofLink(e.target.value)}
              />
              <button
                className="btn btn-success px-4 fw-bold"
                onClick={() => showAlert("Proof link saved!", "success")}
              >
                Save Proof Link
              </button>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editRecord && (
          <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <form onSubmit={handleEdit} className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">Edit Record</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setEditRecord(null)}></button>
                </div>
                <div className="modal-body">
                  {[
                    { label: "Code",          field: "subjectCode" },
                    { label: "Name",          field: "subjectName" },
                    { label: "Year of Intro", field: "yearIntro" },
                    { label: "Impl. Year",    field: "cbcsYear" },
                  ].map(({ label, field }) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label fw-bold">{label}</label>
                      <input
                        type="text" className="form-control"
                        value={editRecord[field] || ""}
                        onChange={e => setEditRecord({ ...editRecord, [field]: e.target.value })} required
                      />
                    </div>
                  ))}
                  <div className="mb-3 row">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Status</label>
                      <select className="form-select" value={editRecord.cbcsStatus || "Yes"}
                        onChange={e => setEditRecord({ ...editRecord, cbcsStatus: e.target.value })}>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
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
