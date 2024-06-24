import { Button } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  //   const navigate = useNavigate();
  //   function NavigateOptionsTables() {
  //     navigate('/options-tables')
  //   }

  return (
    <div className="buttons">
      <Button variant="contained" href="/options-tables">
        Options Tables
      </Button>

      <Button variant="contained" href="/bid-ask-test">
        Bid-Ask DB
      </Button>
    </div>
  );
}

export default Home;
