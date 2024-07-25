import "../../styles/PublicStyles/InitialLandingPage.css";
import landingPagePhoto2 from "../../assets/compressedImg.jpg";

function InitialLandingPage() {
  return (
    <div
      className="home"
      style={{ backgroundImage: `url(${landingPagePhoto2})` }}
    >
      <div className="headerContainer"></div>
    </div>
  );
}

export default InitialLandingPage;
