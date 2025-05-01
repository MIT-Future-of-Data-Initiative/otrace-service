import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Collapse,
  Button,
  Grid,
  Box,
  Chip,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";

const Violations = ({ user, role }) => {
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchController, setSearchController] = useState("");
  const [searchData, setSearchData] = useState("");

  useEffect(() => {
    const fetchViolations = async () => {
      if (!user) return;

      let attestationsData = [];
      let consentsData = [];

      if (role === "consumer") {
        // Simple case for consumers
        const [attestationSnapshot, consentSnapshot] = await Promise.all([
          getDocs(
            query(
              collection(db, "attestations"),
              where("party.email", "==", user.email)
            )
          ),
          getDocs(
            query(
              collection(db, "consent"),
              where("userEmail", "==", user.email)
            )
          ),
        ]);

        attestationsData = attestationSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        consentsData = consentSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } else {
        // For data provider/recipient roles
        const base = collection(db, "attestations");
        const attestationQueries = [
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

        const attestationSnapshots = await Promise.all(
          attestationQueries.map((q) => getDocs(q))
        );

        const attestationDocsMap = new Map();
        attestationSnapshots.forEach((snap) => {
          snap.forEach((doc) => {
            attestationDocsMap.set(doc.id, { id: doc.id, ...doc.data() });
          });
        });
        attestationsData = Array.from(attestationDocsMap.values());

        // Extract unique party.emails from attestations
        const partyEmails = Array.from(
          new Set(
            attestationsData.map((att) => att.party?.email).filter(Boolean)
          )
        );

        // Get all relevant consents for those emails
        const consentSnapshots = await Promise.all(
          partyEmails.map((email) =>
            getDocs(
              query(collection(db, "consent"), where("userEmail", "==", email))
            )
          )
        );

        consentsData = consentSnapshots.flatMap((snap) =>
          snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }

      // Data Violation Checking Logic
      const dataUsageLogs = attestationsData.filter(
        (att) => att.action?.type === "Data Usage"
      );

      let foundViolations = [];

      dataUsageLogs.forEach((usage) => {
        let isNonConsentBasis = usage.action.information.basis !== "consent";

        const matchingConsent = consentsData.find(
          (consent) =>
            consent.data === usage.action.information.data &&
            consent.dataController === usage.action.information.dataController
        );

        let violationReasons = [];

        if (!matchingConsent && !isNonConsentBasis) {
          violationReasons.push("No valid consent found");
        } else if (!matchingConsent && isNonConsentBasis) {
          violationReasons.push(
            `Basis for data usage is ${usage.action.information.basis}. Please inquire with the data recipient to confirm details.`
          );
        } else {
          if (
            matchingConsent.status !== "accepted" &&
            matchingConsent.status !== "expired"
          ) {
            violationReasons.push(
              "Consent status is " + matchingConsent.status
            );
          } else {
            const usageTimestamp = usage.timestamp.toDate();
            const consentExpiration = new Date(matchingConsent.expiration);

            if (consentExpiration.getTime() < usageTimestamp.getTime()) {
              violationReasons.push("Consent has expired");
            }

            if (
              matchingConsent.operationsPermitted !==
              usage.action.information.operation
            ) {
              violationReasons.push("Operations do not match");
            }

            if (matchingConsent.purpose !== usage.action.information.purpose) {
              violationReasons.push("Purposes do not match");
            }
          }
        }

        if (violationReasons.length > 0) {
          foundViolations.push({
            id: usage.id,
            usage,
            matchingConsent,
            violationReasons,
            isNonConsentBasis,
          });
        }
      });

      foundViolations.sort(
        (a, b) => b.usage.timestamp.toDate() - a.usage.timestamp.toDate()
      );

      setViolations(foundViolations);
      setFilteredViolations(foundViolations);
    };

    fetchViolations();
  }, [user, role]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDataSubjectRequest = (violation) => {
    const { usage, violationReasons } = violation;
    const dataController = usage.action.information.dataController;
    const data = usage.action.information.data;
    const operation = usage.action.information.operation;

    const subject = encodeURIComponent(
      `Data Subject Request: Violation Detected`
    );
    const body = encodeURIComponent(
      `Dear ${dataController},\n\n` +
        `I am contacting you regarding a detected data usage violation related to my personal data. Below are the details:\n\n` +
        `- **Data Controller:** ${dataController}\n` +
        `- **Data:** ${data}\n` +
        `- **Operations Performed:** ${operation}\n` +
        `- **Violation Reasons:** ${violationReasons.join(", ")}\n\n` +
        `I kindly request that you address this issue as per data protection regulations.\n\n` +
        `Best regards,\n[Your Name]`
    );

    window.location.href = `mailto:${dataController}?subject=${subject}&body=${body}`;
  };

  useEffect(() => {
    let filtered = violations;
    if (searchController) {
      filtered = filtered.filter((v) =>
        v.usage.action.information.dataController
          .toLowerCase()
          .includes(searchController.toLowerCase())
      );
    }
    if (searchData) {
      filtered = filtered.filter((v) =>
        v.usage.action.information.data
          .toLowerCase()
          .includes(searchData.toLowerCase())
      );
    }
    filtered.sort(
      (a, b) => b.usage.timestamp.toDate() - a.usage.timestamp.toDate()
    );
    setFilteredViolations(filtered);
  }, [searchController, searchData, violations]);

  return (
    <Container maxWidth="md">
      <Box textAlign="center" my={4}>
        <Typography variant="h4" fontWeight="bold" color="error">
          Data Use Violations
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Search by Data Controller"
            variant="outlined"
            value={searchController}
            onChange={(e) => setSearchController(e.target.value)}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Search by Data"
            variant="outlined"
            value={searchData}
            onChange={(e) => setSearchData(e.target.value)}
          />
        </Grid>
      </Grid>

      {filteredViolations.length === 0 ? (
        <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h6" color="green">
            No Violations Detected 🎉
          </Typography>
          <Typography variant="body2" color="textSecondary">
            All data usage checks out!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredViolations.map(
            ({
              id,
              usage,
              matchingConsent,
              violationReasons,
              isNonConsentBasis,
            }) => (
              <Grid item xs={12} key={id}>
                <Card
                  sx={{
                    boxShadow: 3,
                    borderRadius: 2,
                    p: 2,
                    backgroundColor: "#FFEBEE",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" color="error">
                      Violation Detected
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                    >
                      {violationReasons.map((reason, index) => (
                        <Chip
                          key={index}
                          label={reason}
                          color="error"
                          sx={{ fontWeight: "bold" }}
                        />
                      ))}
                    </Stack>
                    <Typography variant="body2" mt={1}>
                      <strong>Data Controller:</strong>{" "}
                      {usage.action.information.dataController}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Data:</strong> {usage.action.information.data}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Operations Performed:</strong>{" "}
                      {usage.action.information.operation}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Data Usage Timestamp:</strong>{" "}
                      {usage.timestamp.toDate().toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Data Usage Purpose:</strong>{" "}
                      {usage.action.information.purpose}
                    </Typography>
                    <Box
                      mt={2}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <Button
                        variant="contained"
                        onClick={() =>
                          handleDataSubjectRequest({ usage, violationReasons })
                        }
                        sx={{
                          backgroundColor: "#D84315", // Deep Orange
                          color: "white",
                          fontWeight: "bold",
                          textTransform: "none",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          "&:hover": { backgroundColor: "#BF360C" }, // Darker shade on hover
                        }}
                      >
                        {!matchingConsent && isNonConsentBasis
                          ? "Inquire About Data Usage "
                          : "Request Data Correction"}
                      </Button>
                    </Box>
                  </CardContent>

                  <Button
                    variant="outlined"
                    startIcon={expanded[id] ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => toggleExpand(id)}
                    sx={{ mx: 2, mb: 2 }}
                  >
                    {expanded[id] ? "Hide Details" : "View Details"}
                  </Button>

                  <Collapse in={expanded[id]} timeout="auto" unmountOnExit>
                    <CardContent
                      sx={{ backgroundColor: "#f5f5f5", borderRadius: 1, p: 2 }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Details:
                      </Typography>
                      {matchingConsent ? (
                        <>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            mt={2}
                          >
                            Consent Details:
                          </Typography>
                          <Typography variant="body2">
                            <strong>Consent Expiration:</strong>{" "}
                            {new Date(
                              matchingConsent.expiration
                            ).toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Operations Permitted:</strong>{" "}
                            {matchingConsent.operationsPermitted}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Consent Status:</strong>{" "}
                            {matchingConsent.status}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Consent Data Usage Purpose:</strong>{" "}
                            {matchingConsent.purpose}
                          </Typography>
                        </>
                      ) : isNonConsentBasis ? (
                        <Typography variant="body2" color="warning" mt={2}>
                          Basis for this data usage is not consent-based. Please
                          confirm with the data recipient about proper data
                          usage justification.
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="error" mt={2}>
                          No valid matching consent found for this data usage!
                        </Typography>
                      )}
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Violations;
