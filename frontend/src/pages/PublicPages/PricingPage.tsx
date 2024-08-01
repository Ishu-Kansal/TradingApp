import React from "react";
import marx from "../../assets/marx.jpg";
import "../../styles/PublicStyles/PricingPage.css";
function PricingPage() {
  return (
    <div
      className="pricing_page"
      style={{ backgroundImage: `url(${marx})` }}
    ></div>
  );
}

export default PricingPage;
