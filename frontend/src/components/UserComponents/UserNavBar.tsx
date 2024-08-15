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
    borderTopLeftRadius: "15px",
    borderTopRightRadius: "15px",
    borderBottomLeftRadius: "15px",
    borderBottomRightRadius: "15px",
  };

  return (
    <div className="userNavbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <BarChartIcon color="primary" fontSize="large" />
        <h1 className="companyName">TradeSquare</h1>
        <div className="hiddenLinks">
          <Link to="/home">Home</Link>
          <Link to="/options-tables">Options Tables</Link>
          <Link to="/bid-ask-test">Bid-Ask Database</Link>
          <Link to="/portfolio">Portfolio</Link>
          <Link to="/profit-calc">Options Profit Calculator</Link>
        </div>
      </div>
      <div className="rightSide">
        <Link to="/home">Home</Link>
        <Link to="/options-tables">Options Tables</Link>
        <Link to="/bid-ask-test">Bid-Ask Database</Link>
        <Link to="/portfolio">Portfolio</Link>
        <Link to="/profit-calc">Options Profit Calculator</Link>
        <Link to="/hist-iv-charts">Historical IV Charts</Link>
        <Button className="logoutButton" sx={logoutButtonStyle} href="/">
          Logout
        </Button>
        <Button className="navbarButton"></Button>
      </div>
    </div>
  );
}

export default UserNavBar;
