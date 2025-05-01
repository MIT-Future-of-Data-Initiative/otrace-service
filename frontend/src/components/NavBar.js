import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Typography, IconButton } from "@mui/material";
import LocationSearchingIcon from "@mui/icons-material/LocationSearching";
import { useOktaAuth } from "@okta/okta-react";
import { useAuth } from "../auth";

const NavBar = () => {
  const navigate = useNavigate();
  const { oktaAuth } = useOktaAuth();
  const { user, role } = useAuth();

  return (
    <AppBar position="static" sx={{ marginBottom: 2 }}>
      <Toolbar>
        {/* Logo */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="logo"
          component={Link}
          to="/"
        >
          <LocationSearchingIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          OTrace
        </Typography>

        {/* Always visible */}
        <Button color="inherit" onClick={() => navigate("/")}>
          Home
        </Button>
        <Button color="inherit" onClick={() => navigate("/about")}>
          About
        </Button>

        {/* Consumer-only pages */}
        {role === "consumer" && (
          <>
            <Button color="inherit" onClick={() => navigate("/introduction")}>
              Introduction
            </Button>
            <Button color="inherit" onClick={() => navigate("/consent-manage")}>
              Manage Consents
            </Button>
          </>
        )}

        {/* Consumers, Data Providers, and Data Recipients pages */}
        {(role === "consumer" ||
          role === "data recipient" ||
          role === "data provider") && (
          <>
            <Button color="inherit" onClick={() => navigate("/attestations")}>
              Attestations
            </Button>
            <Button color="inherit" onClick={() => navigate("/violations")}>
              Violations
            </Button>
          </>
        )}

        {/* Data Provider & Data Recipient pages */}
        {(role === "data provider" || role === "data recipient") && (
          <>
            <Button color="inherit" onClick={() => navigate("/consent-offer")}>
              Consent Offer
            </Button>
            <Button color="inherit" onClick={() => navigate("/data-use")}>
              Data Use
            </Button>
          </>
        )}

        {/* Auth-based navigation */}
        {user ? (
          <Button color="inherit" onClick={() => oktaAuth.signOut()}>
            Logout
          </Button>
        ) : (
          <Button color="inherit" onClick={() => oktaAuth.signInWithRedirect()}>
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
