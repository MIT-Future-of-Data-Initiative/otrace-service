import React from "react";
import { Container, Typography } from "@mui/material";

const About = () => {
  return (
    <Container>
      <Typography variant="h4">About OTrace Protocol</Typography>
      <Typography variant="h6">
        In order to improve trust in the open banking ecosystem, the OTrace
        protocol provides the ability for consumers to track how data is being
        used and shared, even (and especially) across organizational boundaries.
        Traceability will help achieve reliable, scalable detection of data
        misuse, leading to both better internal processes and more effective
        intervention by enforcement authorities when necessary.
      </Typography>
    </Container>
  );
};

export default About;
