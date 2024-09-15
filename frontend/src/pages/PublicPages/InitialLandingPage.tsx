import "../../styles/PublicStyles/InitialLandingPage.css";
import landingPagePhoto2 from "../../assets/landingPagePhoto2.jpg";
import TickerTape from "../../components/PublicComponents/TickerTape";

function InitialLandingPage() {
  return (
    <div className="landing_page">
      <div className="section headerContainer">
        <h1 className="welcomeMessage">Welcome to TradeSquare</h1>
      </div>
      <div
        className="section fancy"
        style={{ backgroundImage: `url(${landingPagePhoto2})` }}
      >
        <div className="textbox">
          <p className="fancyMsg">
            Cutting edge tools designed for traders, by traders
          </p>
          <a className="getStartedLink" href="/register">
            Get started!
          </a>
        </div>
      </div>
      <div className="section tickers">
        <TickerTape />
      </div>
      <div className="section section-3">css makes me wanna kms</div>
    </div>
  );
}

export default InitialLandingPage;
