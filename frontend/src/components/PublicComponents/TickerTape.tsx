import { useEffect, useState } from "react";
import "../../styles/PublicStyles/TickerTape.css"; // Import your styles
import stockData from "./tempTicker.json";
import { HorizontalTicker } from "react-infinite-ticker";

const TickerTape = () => {
  const [stocks, setStocks] = useState([]);

  // Fetch stock data from FAKE_URL
  useEffect(() => {
    const fetchStocks = async () => {
      setStocks(stockData);
      return;
      try {
        const response = await fetch("FAKE_URL"); // Replace FAKE_URL with the actual API URL
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchStocks();

    // Optional: Add an interval to refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchStocks();
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  const duration = stocks.length * 2500;
  return (
    <HorizontalTicker duration={duration}>
      {stocks.map((stock, index) => (
        <div key={index} className="ticker-item">
          <span className="stock-symbol">{stock.symbol}</span>
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
