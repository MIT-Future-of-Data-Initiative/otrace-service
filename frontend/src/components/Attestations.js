import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Collapse,
  Grid,
  Box,
  Paper,
} from "@mui/material";
import { PictureAsPdf } from "@mui/icons-material";
import { Navigate } from "react-router-dom";
import jsPDF from "jspdf";
import { autoTable } from "jspdf-autotable";

const Attestations = ({ role, user }) => {
  const [attestations, setAttestations] = useState([]);
  const [filteredAttestations, setFilteredAttestations] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [actionType, setActionType] = useState("All");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  useEffect(() => {
    const fetchAttestations = async () => {
      if (!user) return;
      let q;
      let querySnapshots = [];
      let attestationsData;
      const base = collection(db, "attestations");

      if (role !== "consumer") {
        const queries = [
          query(
            base,
            where("action.information.dataController", "==", user.firstName)
          ),
          query(
            base,
            where("action.information.dataProvider", "==", user.firstName)
          ),
          query(
            base,
            where("action.information.dataRecipient", "==", user.firstName)
          ),
        ];

        // Run all three queries in parallel
        querySnapshots = await Promise.all(queries.map((q) => getDocs(q)));

        // Flatten and remove duplicates by ID
        const allDocsMap = new Map();
        querySnapshots.forEach((snap) => {
          snap.forEach((doc) => {
            allDocsMap.set(doc.id, { id: doc.id, ...doc.data() });
          });
        });

        attestationsData = Array.from(allDocsMap.values());
      } else {
        q = query(base, where("party.email", "==", user.email));
        const querySnapshot = await getDocs(q);
        attestationsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }
      attestationsData.sort(
        (a, b) => b.timestamp.toDate() - a.timestamp.toDate()
      );
      setAttestations(attestationsData);
      setFilteredAttestations(attestationsData);
    };
    fetchAttestations();
  }, [user, role]);

  if (!["consumer", "data recipient", "data provider"].includes(role)) {
    return <Navigate to="/login" />;
  }

  const filterAttestations = () => {
    let filtered = [...attestations];
    if (actionType !== "All") {
      filtered = filtered.filter((log) => log.action.type === actionType);
    }
    if (startDateTime) {
      filtered = filtered.filter(
        (log) => log.timestamp.toDate() >= new Date(startDateTime)
      );
    }
    if (endDateTime) {
      filtered = filtered.filter(
        (log) => log.timestamp.toDate() <= new Date(endDateTime)
      );
    }
    filtered.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
    setFilteredAttestations(filtered);
  };

  const formatDate = (timestamp) => {
    return timestamp.toDate().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Attestation Logs", 20, 10);
    const tableData = filteredAttestations.map(
      ({ action, party, timestamp }) => [
        action.type,
        party.email,
        formatDate(timestamp),
      ]
    );
    autoTable(doc, {
      head: [["Action Type", "User", "Timestamp"]],
      body: tableData,
    });
    doc.save("attestation_logs.pdf");
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={2}>
          Attestation Logs
        </Typography>
        <Typography
          variant="subtitle1"
          textAlign="center"
          color="text.secondary"
          mb={2}
        >
          Review and analyze attestation records.
        </Typography>

        {/* Filters */}
        <Box display="flex" gap={2} mb={3}>
          <TextField
            select
            label="Action Type"
            fullWidth
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Introduction">Introduction</MenuItem>
            <MenuItem value="Data Usage">Data Usage</MenuItem>
            <MenuItem value="Consent Offer">Consent Offer</MenuItem>
            <MenuItem value="Consent rejected">Consent rejected</MenuItem>
            <MenuItem value="Consent accepted">Consent accepted</MenuItem>
            <MenuItem value="Consent revoked">Consent revoked</MenuItem>
            <MenuItem value="Authorization granted">
              Authorization granted
            </MenuItem>
            <MenuItem value="Authorization revoked">
              Authorization revoked
            </MenuItem>
          </TextField>

          <TextField
            type="datetime-local"
            label="Start Time"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
          />
          <TextField
            type="datetime-local"
            label="End Time"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
          />
          <Button variant="contained" onClick={filterAttestations}>
            Apply
          </Button>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<PictureAsPdf />}
          onClick={exportToPDF}
        >
          Export PDF
        </Button>
      </Paper>

      {/* Attestations List */}
      <Grid container spacing={3}>
        {filteredAttestations.map(({ id, action, party, timestamp }) => (
          <Grid item xs={12} key={id}>
            <Card
              onClick={() =>
                setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
              }
              sx={{ boxShadow: 4, borderRadius: 3, cursor: "pointer" }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6" fontWeight="bold">
                    {action.type}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(timestamp)}
                  </Typography>
                </Box>
              </CardContent>
              <Collapse in={expanded[id]} timeout="auto" unmountOnExit>
                <CardContent
                  sx={{ backgroundColor: "#f5f5f5", borderRadius: 1, p: 2 }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Details:
                  </Typography>
                  {Object.entries(action.information).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {key}:
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : value}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Attestations;
