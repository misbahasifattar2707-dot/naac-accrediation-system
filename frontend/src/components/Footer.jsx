// Footer component — College branding footer
export default function Footer() {
  return (
    <footer className="college-footer mt-auto">
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e, #dc3545)",
          padding: "1.5rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        <div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", letterSpacing: "1px" }}>
            MET BHUJBAL KNOWLEDGE CITY
          </div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.82rem" }}>
            Institute of Engineering, Adgaon, Nashik
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>
          NAAC Documentation Portal · METtrack v1.0
        </div>
      </div>
    </footer>
  );
}
