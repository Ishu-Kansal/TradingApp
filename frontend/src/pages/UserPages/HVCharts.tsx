import axios from "axios";
import { useState } from "react";
import HVChart from "../../components/UserComponents/HVChart";
import { Button, MenuItem, Select, TextField } from "@mui/material";

import "../../styles/UserStyles/pages/HVChartstyles.css";

function HVCharts() {
  const [resData, setResData] = useState({
    dates: [""],
    values: [],
    earnings_dates: [""],
  });
  const [show, setShow] = useState(false);

  const [ticker, setTicker] = useState("");
  const [duration, setDuration] = useState("");
  const [window, setWindow] = useState(0);

  const dateList = ["1mo", "3mo", "6mo", "1y"];

  const dateOptions = dateList.map((duration) => (
    <MenuItem value={duration} key={duration}>
      {duration}
    </MenuItem>
  ));

  function getData() {
    console.log("duration: ", duration);
    axios({
      url: "http://127.0.0.1:5500//historical-volatility-graphs",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: {
        ticker,
        duration,
        window,
      },
    }).then((res) => {
      console.log("received res: ", res.data);
      setResData(res.data);
      setShow(true);
    });
  }

  return (
    <div>
      <div className="HVOptions">
        <span>
          <TextField
            className="HVInput"
            label="Enter Ticker: "
            variant="outlined"
            onChange={(e) => setTicker(e.target.value)}
          />
        </span>
        <span>
          <TextField
            className="HVInput"
            label="Enter Window Size: "
            variant="outlined"
            onChange={(e) => setWindow(parseInt(e.target.value))}
          />
        </span>
        <span>
          <Select
            className="HVInput"
            label="Duration"
            onChange={(e: any) => setDuration(e.target.value)}
            sx={{ minWidth: 200 }}
            defaultValue={""}
          >
            {dateOptions}
          </Select>
        </span>
        <span>
          <Button variant="contained" onClick={getData}>
            Get Historical Volatility Graph
          </Button>
        </span>
      </div>

      {show ? <HVChart response={resData} /> : null}
    </div>
  );
}

export default HVCharts;
