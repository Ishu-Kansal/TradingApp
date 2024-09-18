import { useEffect, useState } from "react";
import "../../styles/PublicStyles/TickerTape.css"; // Import your styles
import { HorizontalTicker } from "react-infinite-ticker";
import axios from "axios";

const TickerTape = () => {
  const TICKER_URL = "http://127.0.0.1:5500//gettickertape";

  const [stocks, setStocks] = useState([{ ticker: "", price: 0, action: 0 }]);

  // Fetch stock data from FAKE_URL
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios({
          url: TICKER_URL,
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        setStocks(response.data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStocks();
  }, []);
  const duration = stocks.length * 2500;
  return (
    <HorizontalTicker duration={duration}>
      {stocks.map((stock, index) => (
        <div key={index} className="ticker-item">
          <span className="stock-symbol">{stock.ticker}</span>
          <span
            className={
              stock.action > 0 ? "stock-price-positive" : "stock-price-negative"
            }
          >
            ${stock.price}
          </span>
        </div>
      ))}
    </HorizontalTicker>
  );
};

export default TickerTape;
