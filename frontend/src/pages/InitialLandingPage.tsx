import { Button } from "@mui/material";
import React from "react";
import "../styles/InitialLandingPage.css";

function InitialLandingPage() {
  return (
    <div className="buttons">
      <Button variant="contained" href="/register">
        Register Now!
      </Button>
      <Button variant="contained" href="/login">
        Login here!
      </Button>
    </div>
  );
}

export default InitialLandingPage;
