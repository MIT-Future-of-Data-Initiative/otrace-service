import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { db } from "../firebase/firebase";
import { useAuth } from "../auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Navigate } from "react-router-dom";

const Introduction = ({ role }) => {
  const [formData, setFormData] = useState({
    dataProvider: "",
    dataRecipient: "",
    service: "",
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { user } = useAuth();

  if (role !== "consumer") return <Navigate to="/login" />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "attestations"), {
      action: { type: "Introduction", information: formData },
      party: { email: user.email },
      timestamp: serverTimestamp(),
    });
    setSnackbarMessage(
      "Attestation for an introduction has been successfully recorded!"
    );
    setOpenSnackbar(true);
  };

  return (
    <Container>
      <Typography variant="h5">Introduction</Typography>
      <Typography variant="h7">
        Fill out the following form to introduce and connect two different
        parties on behalf of yourself to utilize a traceability service.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Data Provider"
          name="dataProvider"
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Data Recipient"
          name="dataRecipient"
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Service"
          name="service"
          onChange={handleChange}
          required
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
      {/* Snackbar Confirmation of Success */}
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

export default Introduction;
