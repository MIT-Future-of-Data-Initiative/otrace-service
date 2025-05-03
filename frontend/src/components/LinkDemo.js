import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import AttestationModalModal from "./AttestationModalDemo";

export default function LinkDemo() {
  const [pairs, setPairs] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function fetchAndMatch() {
      const snapshot = await getDocs(collection(db, "attestations"));
      const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const dataUsages = all.filter((doc) => doc.action?.type === "Data Usage");
      const consents = all.filter(
        (doc) => doc.action?.type === "Consent accepted"
      );

      const matched = dataUsages.map((usage) => {
        const match = consents.find(
          (consent) =>
            consent.party?.email === usage.action?.information?.userEmail &&
            consent.action?.information?.dataController ===
              usage.action?.information?.dataController &&
            consent.action?.information?.data ===
              usage.action?.information?.data
        );
        return { usage, consent: match || null };
      });

      setPairs(matched);
    }

    fetchAndMatch();
  }, []);

  return (
    <div style={styles.container}>
      <h2>📬 Inbox</h2>
      {pairs.length === 0 ? (
        <p>No traceable data usage found.</p>
      ) : (
        pairs.map((pair, idx) => (
          <div key={idx} style={styles.emailCard}>
            <div style={styles.subjectLine}>❌ Loan Application Denied</div>
            <div style={styles.bodyText}>
              {console.log("pair", pair)}
              <p>
                Dear user, your recent loan application submitted to{" "}
                {pair.usage.action.information.dataController} was <b>denied</b>
                .
              </p>
              <p>
                <a
                  href="#"
                  style={styles.link}
                  onClick={() => setSelected(pair)}
                >
                  ➜ See how your data was used and consented
                </a>
              </p>
            </div>
          </div>
        ))
      )}

      {selected && (
        <AttestationModalModal
          attestation={selected.usage}
          consent={selected.consent}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
  },
  emailCard: {
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "1.5rem",
    maxWidth: "600px",
    margin: "1rem 0",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },
  subjectLine: {
    fontWeight: "bold",
    fontSize: "1.1rem",
    marginBottom: "0.5rem",
  },
  bodyText: {
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
