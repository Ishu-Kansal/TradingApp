import React from "react";
import { useLocation } from "react-router-dom";
import UserNavBar from "./UserComponents/UserNavBar";
import WebsiteNavBar from "./PublicComponents/WebsiteNavBar";

function NavBar() {
  const location = useLocation();
  const userpaths = [
    "/home",
    "/options-tables",
    "/bid-ask-test",
    "/portfolio",
    "/profit-calc",
  ];
  return (
    <div>
      {userpaths.includes(location.pathname) ? (
        <UserNavBar />
      ) : (
        <WebsiteNavBar />
      )}
    </div>
  );
}

export default NavBar;
