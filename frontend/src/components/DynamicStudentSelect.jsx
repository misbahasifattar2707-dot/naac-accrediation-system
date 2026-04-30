import React, { useState, useEffect, useRef } from "react";
import { getStudents, addStudent, uploadStudents } from "../api/apiService";

export default function DynamicStudentSelect({ selectedStudents, onChange, courseCode = "", defaultProgramCode = "" }) {
  const [students, setStudents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: "", enrollment_number: "", program_code: defaultProgramCode });
  
  const dropdownRef = useRef(null);

  // Fetch initial data
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents(courseCode);
      setStudents(data);
    } catch (e) {
      console.error("Error fetching students:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseCode]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter functionality
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.enrollment_number && s.enrollment_number.toLowerCase().includes(search.toLowerCase()))
  );

  const isAllSelected = filteredStudents.length > 0 && filteredStudents.every(s => selectedStudents.includes(s.name));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const namesToRemove = filteredStudents.map(s => s.name);
      onChange(selectedStudents.filter(name => !namesToRemove.includes(name)), false); // not all
    } else {
      const namesToAdd = filteredStudents.map(s => s.name);
      const newSelections = [...new Set([...selectedStudents, ...namesToAdd])];
      // Check if this selects basically all students we fetched
      const selectsEverybody = newSelections.length >= students.length;
      onChange(newSelections, selectsEverybody);
    }
  };

  const handleSelectOne = (studentName) => {
    if (selectedStudents.includes(studentName)) {
      onChange(selectedStudents.filter(name => name !== studentName), false);
    } else {
      const newSelections = [...selectedStudents, studentName];
      const selectsEverybody = newSelections.length >= students.length;
      onChange(newSelections, selectsEverybody);
    }
  };

  const handleAddNew = async (e) => {
    e.preventDefault();
    if (!newStudent.name.trim()) return;
    
    try {
      setLoading(true);
      const res = await addStudent(newStudent);
      if (res.success) {
        await fetchStudents();
        onChange([...selectedStudents, res.student.name]);
        setShowAddForm(false);
        setNewStudent({ name: "", enrollment_number: "", program_code: defaultProgramCode });
      } else {
        alert("Error adding student: " + res.message);
      }
    } catch (e) {
      alert("Network error while adding student.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await uploadStudents(formData);
      if (res.success) {
        alert(res.message);
        await fetchStudents();
      } else {
        alert("Upload failed: " + res.message);
      }
    } catch (e) {
      alert("Error uploading file");
    } finally {
      setLoading(false);
      e.target.value = null; // reset input
    }
  };

  return (
    <div className="dynamic-student-select position-relative" ref={dropdownRef}>
      {/* Visual Display Output */}
      <div 
        className="form-control d-flex flex-wrap align-items-center gap-1 cursor-pointer" 
        style={{ minHeight: "45px", cursor: "pointer" }}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {selectedStudents.length === 0 ? (
          <span className="text-muted">Select students... (0 selected)</span>
        ) : (
          <>
            {selectedStudents.slice(0, 5).map(name => (
              <span key={name} className="badge bg-primary d-flex align-items-center gap-1 p-2">
                {name}
                <i 
                  className="bi bi-x-circle ms-1 cursor-pointer" 
                  style={{cursor: 'pointer'}} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectOne(name);
                  }}
                ></i>
              </span>
            ))}
            {selectedStudents.length > 5 && (
              <span className="badge bg-secondary p-2">+{selectedStudents.length - 5} more</span>
            )}
          </>
        )}
      </div>

      <div className="mt-2 d-flex gap-2">
        <label className="btn btn-sm btn-outline-success">
          <i className="bi bi-file-earmark-excel me-1"></i> Bulk Upload Excel
          <input 
            type="file" 
            accept=".xlsx" 
            className="d-none" 
            onChange={handleFileUpload} 
            disabled={loading}
          />
        </label>
        <button 
          type="button" 
          className="btn btn-sm btn-outline-primary" 
          onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        >
          {isOpen ? "Close List" : "Open Dropdown"}
        </button>
      </div>

      {isOpen && (
        <div className="dropdown-menu show shadow p-0 w-100 mt-1" style={{ position: "absolute", zIndex: 1000, maxHeight: "400px", display: "flex", flexDirection: "column" }}>
          
          <div className="p-2 border-bottom sticky-top bg-white z-1">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search students by name or PRN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className="overflow-auto" style={{ maxHeight: "250px" }}>
            {loading && <div className="p-3 text-center text-muted">Loading...</div>}
            


            {!loading && filteredStudents.map(s => {
              const isSelected = selectedStudents.includes(s.name);
              return (
                <div 
                  key={s.id} 
                  className="dropdown-item d-flex justify-content-between align-items-center cursor-pointer"
                  onClick={() => handleSelectOne(s.name)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="form-check d-flex align-items-center mb-0">
                    <input 
                      type="checkbox" 
                      className="form-check-input me-2 mt-0" 
                      checked={isSelected} 
                      readOnly 
                    />
                    <label className="form-check-label mb-0">
                      {s.name} {s.enrollment_number ? <small className="text-muted">({s.enrollment_number})</small> : ""}
                    </label>
                  </div>
                  {s.program_code && <span className="badge bg-light text-dark border">{s.program_code}</span>}
                </div>
              );
            })}

            {!loading && filteredStudents.length === 0 && search && !showAddForm && (
              <div className="p-3 text-center text-muted">No students found matching "{search}"</div>
            )}
          </div>

          <div className="p-2 border-top bg-light sticky-bottom">
            {!showAddForm ? (
              <button 
                type="button" 
                className="btn btn-outline-secondary btn-sm w-100" 
                onClick={(e) => { e.preventDefault(); setShowAddForm(true); setNewStudent({...newStudent, name: search}); }}
              >
                <i className="bi bi-plus-circle me-1"></i> Add Other Student
              </button>
            ) : (
              <div className="card card-body p-2 border border-primary shadow-sm">
                <small className="fw-bold mb-2">Manually Add Student</small>
                <input 
                  type="text" 
                  className="form-control form-control-sm mb-2" 
                  placeholder="Full Name" 
                  value={newStudent.name} 
                  onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                />
                <input 
                  type="text" 
                  className="form-control form-control-sm mb-2" 
                  placeholder="Enrollment / PRN (Optional)" 
                  value={newStudent.enrollment_number} 
                  onChange={e => setNewStudent({...newStudent, enrollment_number: e.target.value})}
                />
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-success btn-sm w-50" onClick={handleAddNew} disabled={loading}>Save</button>
                  <button type="button" className="btn btn-secondary btn-sm w-50" onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
