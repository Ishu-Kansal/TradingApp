import "../../styles/PublicStyles/FeaturePage.css";
import iv_graph_img from "../../assets/iv_graph.png";
import FeatureCardLeft from "../../components/PublicComponents/FeatureCardLeft";
import options_tables_img from "../../assets/options_tables.png";
import orderbook_img from "../../assets/orderbook.png";
import profit_calc_img from "../../assets/profit_calc.png";
import FeatureCardRight from "../../components/PublicComponents/FeatureCardRight";

function FeaturePage() {
  const optionsTableDescription =
    "Explore a wide range of options designed to meet your specific needs and preferences. Find the perfect solution with ease, ensuring you make informed choices that truly fit your requirements.";
  const orderbookDescription =
    "Experience seamless order management with our Peer-to-Peer system, delivering reliability, consistency, and lightning-fast fulfillment—completely hassle-free!";

  const profitCalcDescription =
    "Take your options strategy to the next level—accurately predict pricing with our advanced tools, and customize your IV series for unparalleled insight and control like never before.";
  const ivGraphDescription =
    "See the bigger picture—plot historical volatility with stock prices to uncover how major market events impact stock behavior and reveal key trends.";

  return (
    <div className="featurePage">
      <h1 className="title">Explore our cutting edge trading tools</h1>
      <div className="featureList">
        <FeatureCardLeft
          imagePath={options_tables_img}
          description={optionsTableDescription}
        />
        <FeatureCardRight
          imagePath={orderbook_img}
          description={orderbookDescription}
        />
        <FeatureCardLeft
          imagePath={profit_calc_img}
          description={profitCalcDescription}
        />
        <FeatureCardRight
          imagePath={iv_graph_img}
          description={ivGraphDescription}
        />
      </div>
    </div>
  );
}

export default FeaturePage;
