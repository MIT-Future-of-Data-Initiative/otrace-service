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
import {
  dataUsesGrouped,
  dataCategoriesGrouped,
  dataSubjects,
} from "../utils/fides";

const ConsentOffer = ({ role }) => {
  const [formData, setFormData] = useState({
    dataController: "",
    userEmail: "",
    data: "",
    dataCategory: "",
    dataSubject: "",
    operationsPermitted: "",
    purpose: "",
    expiration: "",
  });

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [inputPurpose, setInputPurpose] = useState("");
  const [inputCategory, setInputCategory] = useState("");
  const [inputSubject, setInputSubject] = useState("");

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

    await addDoc(collection(db, "consent"), {
      ...formData,
      status: "offered",
      timestamp: serverTimestamp(),
    });

    await addDoc(collection(db, "attestations"), {
      action: {
        type: "Consent Offer",
        information: { ...formData, status: "offered" },
      },
      party: { email: formData.userEmail },
      timestamp: serverTimestamp(),
    });
    setSnackbarMessage(
      "Consent has been offered and an attestation record has been successfully created!"
    );
    setOpenSnackbar(true);
  };

  const filteredDataUsesOptions = dataUsesGrouped.filter((option) =>
    option.label.startsWith(inputPurpose)
  );

  const filteredDataCategoriesOptions = dataCategoriesGrouped.filter((option) =>
    option.label.startsWith(inputCategory)
  );

  return (
    <Container>
      <Typography variant="h5">
        Requesting Terms of Proposed Data Usage
      </Typography>
      <Typography variant="h7">
        Fill out the following form to request a contract with certain
        parameterized permission from the consumer regarding their data.
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
          label="User Email"
          name="userEmail"
          onChange={handleChange}
          required
          margin="normal"
          error={!!emailError}
          helperText={emailError}
        />
        <TextField
          fullWidth
          label="Data"
          name="data"
          onChange={handleChange}
          required
          margin="normal"
        />
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
        <Autocomplete
          fullWidth
          freeSolo
          options={filteredDataCategoriesOptions}
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.label}
          inputValue={inputCategory}
          onInputChange={(e, newVal) => setInputCategory(newVal)}
          onChange={(e, value) =>
            setFormData({ ...formData, dataCategory: value?.label || "" })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Data Category"
              name="dataCategory"
              margin="normal"
              required
            />
          )}
        />
        <Autocomplete
          fullWidth
          freeSolo
          options={dataSubjects.filter((s) =>
            s.toLowerCase().startsWith(inputSubject.toLowerCase())
          )}
          inputValue={inputSubject}
          onInputChange={(e, newVal) => setInputSubject(newVal)}
          onChange={(e, value) =>
            setFormData({ ...formData, dataSubject: value || "" })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Data Subject"
              name="dataSubject"
              margin="normal"
              required
            />
          )}
        />
        <FormControl fullWidth margin="normal" variant="outlined">
          <InputLabel shrink>Operations Permitted</InputLabel>
          <Select
            name="operationsPermitted"
            value={formData.operationsPermitted}
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
        <TextField
          fullWidth
          label="Expiration Time"
          name="expiration"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
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

export default ConsentOffer;
