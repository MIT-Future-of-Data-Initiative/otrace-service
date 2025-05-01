import React from "react";
import { Container, Typography } from "@mui/material";

const Home = () => {
  return (
    <Container sx={{ textAlign: "center" }}>
      <Typography variant="h3">Welcome to OTrace</Typography>
      <Typography variant="h5">
        Track and manage data usage transparently.
      </Typography>
    </Container>
  );
};

export default Home;
