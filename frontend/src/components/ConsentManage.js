import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Container,
  Grid,
  Box,
  Alert,
  Snackbar,
  Avatar,
  Paper,
  Divider,
  Tooltip,
  MenuItem,
  TextField,
} from "@mui/material";
import { Navigate } from "react-router-dom";
import { CheckCircle, Cancel, Info, Block } from "@mui/icons-material";

const ConsentManage = ({ role, user }) => {
  const [consents, setConsents] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterController, setFilterController] = useState("");

  useEffect(() => {
    const fetchConsents = async () => {
      const q = query(
        collection(db, "consent"),
        where("userEmail", "==", user.email)
      );
      const querySnapshot = await getDocs(q);
      const currentDate = new Date();
      const updatedConsents = [];

      for (let docSnap of querySnapshot.docs) {
        let consent = { id: docSnap.id, ...docSnap.data() };
        if (consent.expiration && new Date(consent.expiration) < currentDate) {
          await updateDoc(doc(db, "consent", consent.id), {
            status: "expired",
          });
          consent.status = "expired";
        }
        updatedConsents.push(consent);
      }
      setConsents(updatedConsents);
    };
    fetchConsents();
  }, [user]);

  if (role !== "consumer") return <Navigate to="/login" />;

  const updateConsent = async (
    id,
    status,
    data,
    operationsPermitted,
    dataController,
    purpose
  ) => {
    await updateDoc(doc(db, "consent", id), { status });
    setConsents(consents.map((c) => (c.id === id ? { ...c, status } : c)));
    await addDoc(collection(db, "attestations"), {
      action: {
        type: `Consent ${status}`,
        information: {
          data: data,
          operationsPermitted: operationsPermitted,
          status: status,
          dataController: dataController,
          purpose: purpose,
        },
      },
      party: { email: user.email },
      timestamp: serverTimestamp(),
    });
    setSnackbarMessage(
      `Consent has been ${status} and an attestation record has been successfully created!`
    );
    setOpenSnackbar(true);
  };

  const filteredConsents = consents.filter(
    ({ status, dataController }) =>
      (filterStatus ? status === filterStatus : true) &&
      (filterController
        ? dataController.toLowerCase().includes(filterController.toLowerCase())
        : true)
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold">
            Manage Your Data Consents
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Review and manage requests from data controllers to use your data.
          </Typography>
        </Box>
        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="Filter by Data Controller"
            variant="outlined"
            fullWidth
            onChange={(e) => setFilterController(e.target.value)}
          />
          <TextField
            select
            label="Filter by Status"
            variant="outlined"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="offered">Offered</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="revoked">Revoked</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </TextField>
        </Box>
        <Grid container spacing={3}>
          {filteredConsents.map(
            ({
              id,
              data,
              operationsPermitted,
              status,
              dataController,
              purpose,
            }) => (
              <Grid item xs={12} sm={6} md={4} key={id}>
                <Card
                  sx={{
                    boxShadow: 4,
                    borderRadius: 3,
                    p: 2,
                    backgroundColor:
                      status === "accepted"
                        ? "#E8F5E9" // Light green
                        : status === "rejected"
                        ? "#FFCDD2" // Soft red
                        : status === "revoked"
                        ? "#FFAB91" // Deeper red-orange
                        : status === "expired"
                        ? "#E0E0E0" // Light gray
                        : "#FFFDE7", // Default light yellow for "offered"
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                        {dataController.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {dataController}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Data Controller
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      <strong>Data Requested:</strong> {data}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Operations Permitted:</strong>{" "}
                      {operationsPermitted}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Purpose:</strong> {purpose}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        display: "flex",
                        alignItems: "center",
                        color:
                          status === "accepted"
                            ? "green"
                            : status === "offered"
                            ? "orange"
                            : "red",
                      }}
                    >
                      <Info sx={{ fontSize: 16, mr: 1 }} />
                      <strong>Status:</strong> {status}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: "space-between" }}>
                    <Tooltip title="Approve data sharing consent">
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() =>
                          updateConsent(
                            id,
                            "accepted",
                            data,
                            operationsPermitted,
                            dataController,
                            purpose
                          )
                        }
                        disabled={
                          (status === "accepted") | (status === "expired")
                        }
                      >
                        Accept
                      </Button>
                    </Tooltip>
                    {status === "accepted" ? (
                      <Tooltip title="Revoke data sharing consent">
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Block />}
                          onClick={() =>
                            updateConsent(
                              id,
                              "revoked",
                              data,
                              operationsPermitted,
                              dataController,
                              purpose
                            )
                          }
                          disabled={
                            (status === "revoked") | (status === "expired")
                          }
                        >
                          Revoke
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Deny data sharing consent">
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() =>
                            updateConsent(
                              id,
                              "rejected",
                              data,
                              operationsPermitted,
                              dataController,
                              purpose
                            )
                          }
                          disabled={
                            (status === "rejected") |
                            ((status === "revoked") | (status === "expired"))
                          }
                        >
                          Reject
                        </Button>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ConsentManage;
