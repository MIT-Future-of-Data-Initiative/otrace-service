import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import { validateEmail } from "../utils/util";
import { dataUsesGrouped } from "../utils/fides";

const DataUse = ({ role }) => {
  const [formData, setFormData] = useState({
    dataController: "",
    data: "",
    userEmail: "",
    operation: "",
    basis: "",
    purpose: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [inputPurpose, setInputPurpose] = useState("");

  if (role !== "data provider" && role !== "data recipient")
    return <Navigate to="/login" />;

  const handleChange = (e) => {
    if (e.target.name === "userEmail") {
      // Email Validation
      if (!validateEmail(e.target.value)) {
        setEmailError("Invalid email format");
        return;
      }
      setEmailError("");
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "attestations"), {
      action: {
        type: "Data Usage",
        information: { ...formData },
      },
      party: { email: formData.userEmail },
      timestamp: serverTimestamp(),
    });
    setSnackbarMessage(
      "Attestation record of data usage has been successfully created!"
    );
    setOpenSnackbar(true);
  };

  const filteredDataUsesOptions = dataUsesGrouped.filter((option) =>
    option.label.startsWith(inputPurpose)
  );

  return (
    <Container>
      <Typography variant="h5">Using Consumer Data</Typography>
      <Typography variant="h7">
        Fill out the following form to record a usage of consumer's data.
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Data Controller"
          name="dataController"
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Data"
          name="data"
          onChange={handleChange}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="User Email"
          name="userEmail"
          onChange={handleChange}
          required
          margin="normal"
          error={!!emailError}
          helperText={emailError}
        />
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel shrink>Operation Performed</InputLabel>
          <Select
            name="operation"
            value={formData.operation}
            onChange={handleChange}
            required
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select an option
            </MenuItem>
            <MenuItem value="read-only">Read Only</MenuItem>
            <MenuItem value="write-only">Write Only</MenuItem>
            <MenuItem value="read-write">Read and Write</MenuItem>
            <MenuItem value="transform">Transform</MenuItem>
            <MenuItem value="aggregate">Aggregate</MenuItem>
          </Select>
        </FormControl>
        <Autocomplete
          fullWidth
          freeSolo
          options={filteredDataUsesOptions}
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          inputValue={inputPurpose}
          onInputChange={(e, newValue) => setInputPurpose(newValue)}
          onChange={(e, value) =>
            setFormData({ ...formData, purpose: value?.label || "" })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Data Purpose"
              name="purpose"
              margin="normal"
              required
            />
          )}
        />
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel shrink>Basis</InputLabel>
          <Select
            name="basis"
            value={formData.basis}
            onChange={handleChange}
            required
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select an option
            </MenuItem>
            <MenuItem value="consent">Consent</MenuItem>
            <MenuItem value="public-interest">Public Interest</MenuItem>
            <MenuItem value="legitimate-interest">Legitimate Interest</MenuItem>
            <MenuItem value="legal-obligation">Legal Obligation</MenuItem>
          </Select>
        </FormControl>
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

export default DataUse;
