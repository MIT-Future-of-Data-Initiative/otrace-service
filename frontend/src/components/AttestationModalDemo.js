import React, { useState } from "react";

export default function AttestationModalModal({
  attestation,
  consent,
  onClose,
}) {
  const [showConsentJson, setShowConsentJson] = useState(false);

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        <h3>📄 Data Usage Attestation</h3>
        <p>
          <b>Time:</b> {formatTimestamp(attestation.timestamp)}
        </p>

        <pre style={jsonBlock}>{JSON.stringify(attestation, null, 2)}</pre>

        {consent ? (
          <>
            <hr />
            <a
              href="#"
              style={toggleLink}
              onClick={(e) => {
                e.preventDefault();
                setShowConsentJson((prev) => !prev);
              }}
            >
              {showConsentJson
                ? "Hide Consent Acceptance JSON"
                : "Show Matching Consent Acceptance JSON"}
            </a>

            {showConsentJson && (
              <pre style={jsonBlock}>{JSON.stringify(consent, null, 2)}</pre>
            )}
          </>
        ) : (
          <p style={{ marginTop: "1rem", color: "#666" }}>
            <i>No matching consent acceptance found.</i>
          </p>
        )}

        <button onClick={onClose} style={buttonStyle}>
          Close
        </button>
      </div>
    </div>
  );
}

// 🧱 Styles
const backdrop = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modal = {
  backgroundColor: "#fff",
  padding: "2rem",
  borderRadius: "10px",
  width: "600px",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
};

const jsonBlock = {
  backgroundColor: "#f7f7f7",
  padding: "1rem",
  borderRadius: "5px",
  fontSize: "0.85rem",
  maxHeight: "300px",
  overflowY: "auto",
};

const toggleLink = {
  display: "block",
  marginTop: "1rem",
  color: "#007bff",
  cursor: "pointer",
  textDecoration: "none",
};

const buttonStyle = {
  marginTop: "1.5rem",
  padding: "0.5rem 1rem",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
