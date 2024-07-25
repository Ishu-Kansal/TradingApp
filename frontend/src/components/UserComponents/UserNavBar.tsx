import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BarChartIcon from "@mui/icons-material/BarChart";
import { Button } from "@mui/material";
import "../../styles/UserStyles/UserNavBar.css";
function UserNavBar() {
  const [openLinks, setOpenLinks] = useState(false);

  const toggleBar = () => {
    setOpenLinks(!openLinks);
  };

  const logoutButtonStyle = {
    "&:hover": {
      backgroundColor: "#3e464d",
    },
    "&:active": {
      backgroundColor: "black",
    },
    backgroundColor: "#121619",
    width: "100px",
    "border-top-left-radius": "15px",
    "border-top-right-radius": "15px",
    "border-bottom-left-radius": "15px",
    "border-bottom-right-radius": "15px",
  };

  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <BarChartIcon color="primary" fontSize="large" />
        <h1 className="companyName">TradeSquare</h1>
        <div className="hiddenLinks">
          <Link to="/home">Home</Link>
          <Link to="/options-tables">Options Tables</Link>
          <Link to="/bid-ask-test">Bid-Ask Database</Link>
          <Link to="/portfolio">Portfolio</Link>
        </div>
      </div>
      <div className="rightSide">
        <Link to="/home">Home</Link>
        <Link to="/options-tables">Options Tables</Link>
        <Link to="/bid-ask-test">Bid-Ask Database</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Button className="logoutButton" sx={logoutButtonStyle} href="/">
          Logout
        </Button>
        <Button className="navbarButton">Hello</Button>
      </div>
    </div>
  );
}

export default UserNavBar;
