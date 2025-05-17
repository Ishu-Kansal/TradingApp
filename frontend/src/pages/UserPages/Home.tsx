import "../../styles/UserStyles/pages/Home.css";
import HomePageCard from "../../components/UserComponents/HomePageCard";

import iv_graph_img from "../../assets/iv_graph.png";
import options_tables_img from "../../assets/options_tables.png";
import orderbook_img from "../../assets/orderbook.png";
import profit_calc_img from "../../assets/profit_calc.png";

function Home() {
  return (
    <div className="homepage">
      <div id="title">
        {" "}
        <h1 id="head">Welcome to TradeSquare, {`{username}!`}</h1>
        <h1 id="subhead">Explore our offerings below</h1>
      </div>
      <div id="grid">
        <HomePageCard
          description="options tables"
          img_url={options_tables_img}
          path_url="/options-tables"
        />
        <HomePageCard
          description="iv graphs"
          img_url={iv_graph_img}
          path_url="/hist-iv-charts"
        />
        <HomePageCard
          description="orderbooks"
          img_url={orderbook_img}
          path_url="/bid-ask-test"
        />
        <HomePageCard
          description="profit calc"
          img_url={profit_calc_img}
          path_url="/profit-calc"
        />
        <HomePageCard
          description="portfolio"
          img_url={options_tables_img}
          path_url="/portfolio"
        />
      </div>
    </div>
  );
}

export default Home;
