import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { getAcademicYears } from "../api/apiService";

export default function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState("Admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [program, setProgram] = useState("MCA");
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2024-25");

  useEffect(() => {
    getAcademicYears().then(years => {
      setAcademicYears(years);
      if (years.length > 0) {
        // Default to the latest year or a sensible default
        setSelectedYear(years[years.length - 1]);
      }
    });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, academic_year: selectedYear })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // We inject the selected program here
        const user = { ...data.user, program, programCode: program === "MCA" ? "515124110" : "000000000" };
        localStorage.setItem("mettrack_user", JSON.stringify(user));
        navigate("/dashboard");
      } else {
        setError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      setError("Network error. Could not connect to API.");
    }
  };

  const roles = ["Super Admin", "Admin", "Staff"];

  return (
    <div className="app-layout" style={{ minHeight: "100vh", width: "100vw" }}>
      {/* Left sidebar */}
      <div style={{
        width: 260, minWidth: 260, background: "#1a1a2e", color: "#fff",
        minHeight: "100vh", display: "flex", flexDirection: "column", padding: "2rem 0",
        flexShrink: 0,
      }}>
        <div style={{ padding: "0 1.5rem 2rem", fontFamily: "'DM Serif Display',serif", fontSize: "1.6rem", borderBottom: "1px solid rgba(255,255,255,0.1)", letterSpacing: 3 }}>
          MET<span style={{ color: "#dc3545" }}>track</span>
        </div>
        <nav style={{ padding: "1rem 0" }}>
          <button className="sidebar-link" onClick={() => navigate("/")}>
            <i className="bi bi-house-door"></i> Home
          </button>
          <button className="sidebar-link" onClick={() => navigate("/register")}>
            <i className="bi bi-person-plus"></i> Register
          </button>
          {roles.map((r) => (
            <button
              key={r}
              className={`sidebar-link ${role === r ? "active" : ""}`}
              onClick={() => { setRole(r); setError(""); }}
            >
              <i className={`bi bi-${r === "Super Admin" ? "shield-lock" : r === "Admin" ? "person-badge" : "people"}`}></i>
              {r}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "auto" }}>
        <header style={{ padding: "1.5rem 2rem", background: "#fff", borderBottom: "1px solid #e9ecef", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", flexShrink: 0 }}>
          <h4 style={{ color: "#dc3545", fontWeight: 700, margin: 0 }}>{role} Portal Access</h4>
        </header>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div className="card border-0 shadow-lg p-5 fade-in" style={{ maxWidth: 440, width: "100%", borderRadius: 20 }}>
            <div className="text-center mb-4">
              <div style={{
                width: 70, height: 70, borderRadius: "50%",
                background: "#dc3545", display: "flex", alignItems: "center",
                justifyContent: "center", margin: "0 auto 1rem"
              }}>
                <i className="bi bi-lock-fill" style={{ fontSize: "1.8rem", color: "#fff" }}></i>
              </div>
              <h3 className="fw-bold">{role} Login</h3>
              <p className="text-muted small">Enter your credentials to access the portal</p>
            </div>

            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label-custom">Program</label>
                <select className="form-select form-control-lg" value={program} onChange={e => setProgram(e.target.value)}>
                  <option value="MCA">MCA</option>
                  <option value="MBA">MBA</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label-custom">Academic Year</label>
                <select 
                  className="form-select form-control-lg" 
                  value={selectedYear} 
                  onChange={e => setSelectedYear(e.target.value)}
                >
                  <option value="" disabled>Select Year</option>
                  {academicYears.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label-custom">Username</label>
                <input
                  type="text" className="form-control form-control-lg"
                  placeholder="Enter username" value={username}
                  onChange={(e) => setUsername(e.target.value)} required
                />
              </div>
              <div className="mb-4">
                <label className="form-label-custom">Password</label>
                <input
                  type="password" className="form-control form-control-lg"
                  placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} required
                />
              </div>
              <button type="submit" className="btn btn-danger w-100 py-3 fw-bold text-uppercase">
                Login to Portal
              </button>
              
              <div className="text-center mt-4">
                <span className="text-muted">Don't have an account? </span>
                <a href="/register" className="text-danger fw-bold text-decoration-none">Register here</a>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
