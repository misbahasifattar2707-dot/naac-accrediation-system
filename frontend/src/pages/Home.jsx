import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f4f6f9" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #dc3545 100%)",
        padding: "2.5rem 2rem",
        textAlign: "center",
        color: "#fff",
      }}>
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", fontWeight: 400, letterSpacing: 2, marginBottom: "0.3rem" }}>
          MET BHUJBAL KNOWLEDGE CITY
        </h1>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 400, opacity: 0.85, marginBottom: "0.2rem" }}>
          INSTITUTE OF ENGINEERING
        </h2>
        <p style={{ opacity: 0.65, margin: 0, fontSize: "0.95rem" }}>Adgaon, Nashik</p>
      </header>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
        <div className="card border-0 shadow-lg p-5 text-center fade-in" style={{ maxWidth: 640, width: "100%", borderRadius: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg,#dc3545,#c0392b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem", boxShadow: "0 8px 24px rgba(220,53,69,0.3)"
          }}>
            <i className="bi bi-shield-check" style={{ fontSize: "2rem", color: "#fff" }}></i>
          </div>

          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2.2rem", color: "#1a1a2e", marginBottom: "0.5rem" }}>
            Welcome to <span style={{ color: "#dc3545" }}>MET<span style={{ textTransform: "lowercase" }}>track</span></span>
          </h2>
          <p className="text-muted" style={{ fontSize: "1.05rem", marginBottom: "2rem", lineHeight: 1.6 }}>
            Your comprehensive tracking system for NAAC data precision and institutional documentation.
          </p>

          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button className="btn btn-danger px-5 py-3 fw-bold rounded-pill shadow" onClick={() => navigate("/login")}>
              <i className="bi bi-box-arrow-in-right me-2"></i> Login to Portal
            </button>
            <button className="btn btn-outline-dark px-5 py-3 fw-bold rounded-pill" onClick={() => navigate("/register")}>
              <i className="bi bi-person-plus me-2"></i> Register Account
            </button>
          </div>

          <div className="mt-4 pt-3 border-top">
            <p className="small text-uppercase text-muted fw-bold mb-0" style={{ letterSpacing: 2, fontSize: "0.72rem" }}>
              Excellence in Quality Assurance
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
