import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BarChartIcon from "@mui/icons-material/BarChart";
import { Button } from "@mui/material";
import "../../styles/PublicStyles/WebsiteNavBar.css";

function WebsiteNavBar() {
  const [openLinks, setOpenLinks] = useState(false);

  const toggleBar = () => {
    setOpenLinks(!openLinks);
  };

  const loginButtonStyle = {
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

  const startButtonStyle = {
    "&:hover": {
      backgroundColor: "#3e464d",
    },
    "&:active": {
      backgroundColor: "black",
    },
    background: "linear-gradient(75deg, #00bce6, #2962ff 50.31%, #d500f9)",
    width: "150px",
    "font-family":
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    "font-style": "normal",
    "font-size": "30px",
    "font-weight": "1000",
    "line-height": "24px",
    color: "white",
    "border-radius": "2em 20px 2.5em 0.2in",
    "text-transform": "none",
  };

  const companyButtonStyle = {
    "text-transform": "none",
  };

  return (
    <div className="navbar">
      <div className="leftSide" id={openLinks ? "open" : "close"}>
        <BarChartIcon color="primary" fontSize="large" />
        <Button className="companyName" href="/" sx={companyButtonStyle}>
          TradeSquare
        </Button>
        <div className="hiddenLinks">
          <Link to="/products">Products</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/learn">Learn</Link>
          <Link to="/community">Community</Link>
          <Link to="/about">About</Link>
        </div>
      </div>
      <div className="centerSide">
        <Link to="/products">Products</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/learn">Learn</Link>
        <Link to="/community">Community</Link>
        <Link to="/about">About</Link>
        <Button className="navbarButton">Hello</Button>
      </div>
      <div className="rightSide">
        <Button
          className="startButton"
          sx={startButtonStyle}
          href="/loginbuttons"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}

export default WebsiteNavBar;
