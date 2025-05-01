import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Container } from "@mui/material";
import { LoginCallback } from "@okta/okta-react";
import { useAuth } from "./auth";

import Home from "./components/Home";
import Introduction from "./components/Introduction";
import Attestations from "./components/Attestations";
import ConsentManage from "./components/ConsentManage";
import ConsentOffer from "./components/ConsentOffer";
import DataUse from "./components/DataUse";
import NavBar from "./components/NavBar";
import About from "./components/About";
import Violations from "./components/Violations";

function App() {
  const { user, role } = useAuth();

  return (
    <div>
      <NavBar user={user} />
      <Container>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/about" element={<About />} />

          {/* Role-protected routes */}
          <Route
            path="/introduction"
            element={
              role === "consumer" ? (
                <Introduction role={role} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/consent-offer"
            element={
              role === "data provider" || role === "data recipient" ? (
                <ConsentOffer role={role} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/consent-manage"
            element={
              role === "consumer" ? (
                <ConsentManage role={role} user={user} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/data-use"
            element={
              role === "data provider" || role === "data recipient" ? (
                <DataUse role={role} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/attestations"
            element={
              role === "consumer" ||
              role === "data provider" ||
              role === "data recipient" ? (
                <Attestations role={role} user={user} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/violations"
            element={
              role === "consumer" ||
              role === "data provider" ||
              role === "data recipient" ? (
                <Violations role={role} user={user} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          {/* Default fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
