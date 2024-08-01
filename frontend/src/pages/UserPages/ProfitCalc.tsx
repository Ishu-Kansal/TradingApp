import { Button, MenuItem, Select, TextField } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { HeatMapGrid } from "react-grid-heatmap";

function ProfitCalc() {
  const [symbol, setSymbol] = useState("");
  const [expDate, setExpDate] = useState("");
  const [strike, setStrike] = useState(0);
  const [optionType, setOptionType] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [expList, setExpList] = useState([]);

  const [pnlSeries, setPNLSeries] = useState();
  const [profitSeriesPct, setprofitSeriesPct] = useState();
  const [optionPrice, setOptionPrice] = useState(0);

  const newList = expList.map((e) => (
    <MenuItem value={e} key={e}>
      {e}
    </MenuItem>
  ));

  const handleSearchStock = async () => {
    const dataIn = { symbol: symbol };

    fetch("http://127.0.0.1:5500/options-exp", {
      method: "post",
      body: JSON.stringify(dataIn),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        setExpList(responseJSON.exps);
        setExpDate(responseJSON.exps[0]);
        return responseJSON;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getOptionsProfits = async () => {
    const dataIn = {
      symbol,
      exp_date: expDate,
      strike,
      free_rate: 5.25,
      type: optionType,
      max_price: maxPrice,
      min_price: minPrice,
    };
    console.log("sending data: ", dataIn);
    axios({
      url: "http://127.0.0.1:5500/options-profit-calculator",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: dataIn,
    })
      .then((response) => {
        console.log("response: ", response);
        setPNLSeries(response.data);
        const profits = response.data.data.map((row) => {
          return row.map((element) => {
            return (
              Math.round(
                ((element - response.data.curr_option_price) /
                  response.data.curr_option_price) *
                  1000
              ) / 10
            );
          });
        });
        console.log("profit series: ", profits);
        setprofitSeriesPct(profits);
        setOptionPrice(response.data.curr_option_price);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="profit-calc">
      <span>
        <Button variant="contained" href="/home">
          Back Home
        </Button>
      </span>

      <span>
        <TextField
          label="Enter Ticker: "
          variant="outlined"
          onChange={(e) => setSymbol(e.target.value)}
        />
      </span>
      <span>
        <Button
          variant="contained"
          onClick={function () {
            handleSearchStock();
          }}
        >
          Submit Ticker
        </Button>
      </span>
      <span>
        <Select
          label="ExpDate"
          onChange={(e: any) => setExpDate(e.target.value)}
          sx={{ minWidth: 200 }}
          defaultValue={""}
        >
          {newList}
        </Select>
      </span>
      <span>
        <TextField
          label="Enter strike"
          variant="outlined"
          onChange={(e) => setStrike(parseInt(e.target.value))}
        />
      </span>
      <span>
        <Select
          label="Enter Type:"
          onChange={(e: any) => setOptionType(e.target.value)}
          sx={{ minWidth: 200 }}
          defaultValue={""}
        >
          <MenuItem value={"calls"} key={"calls"}>
            Call
          </MenuItem>
          <MenuItem value={"put"} key={"put"}>
            Put
          </MenuItem>
        </Select>
      </span>
      <span>
        <TextField
          label="Min Price"
          variant="outlined"
          onChange={(e) => setMinPrice(parseInt(e.target.value))}
        />
      </span>
      <span>
        <TextField
          label="Max Price"
          variant="outlined"
          onChange={(e) => setMaxPrice(parseInt(e.target.value))}
        />
      </span>

      <span>
        <Button variant="contained" onClick={getOptionsProfits}>
          Submit Expiration
        </Button>
      </span>
      <h1>PnL: </h1>
      <div>
        {/* {pnlSeries && <PnLTable optionsSeries={pnlSeries}>Calls</PnLTable>} */}
        {pnlSeries && (
          <HeatMapGrid
            data={profitSeriesPct}
            xLabels={pnlSeries.days_series}
            yLabels={pnlSeries.price_series}
            cellHeight="20px"
            cellRender={(x, y, value) => (
              <div
                title={`${value}%\n($${Math.round(
                  (pnlSeries.data[x][y] - optionPrice) * 100
                )})`}
              >
                {value}
              </div>
            )}
            cellStyle={(_x, _y, value) => ({
              background:
                profitSeriesPct[_x][_y] > 0
                  ? `rgba(0, 158, 76, ${value})`
                  : `rgba(255, 0, 35, ${(1 - value) / 1.3})`,
              color: `rgb(0, 0, 0)`,
            })}
          ></HeatMapGrid>
        )}
      </div>
    </div>
  );
}

export default ProfitCalc;
