import { useState } from "react";
import GexGraph from "../../components/UserComponents/GexGraph";
import { GexGraphInput } from "../../components/UserComponents/GexGraph";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

const BASE_URL = import.meta.env.VITE_BASE_BACKEND_URL;

function GEX() {
  const [inputTicker, setInputTicker] = useState("");
  const [inputExp, setInputExp] = useState("");
  const [expList, setExpList] = useState([]);

  //new stuff
  const [stockPrice, setStockPrice] = useState(0.0);
  const [callStrikes, setCallStrikes] = useState([]);
  const [putStrikes, setPutStrikes] = useState([]);
  const [putGEX, setPutGEX] = useState([]);
  const [callGEX, setCallGEX] = useState([]);

  // change these methods

  const handleSearchExp = async () => {
    const dataIn = { symbol: inputTicker };

    fetch(BASE_URL + "/options-exp", {
      method: "post",
      body: JSON.stringify(dataIn),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        setExpList(responseJSON.exps);
        setInputExp(responseJSON.exps[0]);
        return responseJSON;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleSearchGex = async () => {
    const dataIn = { ticker: inputTicker, expiration: inputExp };

    fetch("http://127.0.0.1:5500/get-gex", {
      method: "post",
      body: JSON.stringify(dataIn),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        setStockPrice(responseJson.curr_price);
        setCallStrikes(responseJson.callStrikes);
        setPutStrikes(responseJson.putStrikes);
        setCallGEX(responseJson.callGEX);
        setPutGEX(responseJson.putGEX);
      });
  };

  const newList = expList.map((e) => <MenuItem value={e}>{e}</MenuItem>);

  // new graph stuff

  return (
    <div className="GEX-Page">
      <div id="Search-Buttons">
        <span>
          <Button variant="contained" href="/home">
            Back Home
          </Button>
        </span>

        <span>
          <TextField
            id="outlined-basic"
            label="Enter Ticker: "
            variant="outlined"
            onChange={(e) => setInputTicker(e.target.value)}
          />
        </span>
        <span>
          <Button
            variant="contained"
            onClick={function () {
              handleSearchExp();
            }}
          >
            Submit
          </Button>
        </span>

        <span>
          <FormControl
            style={{
              minWidth: 200,
            }}
          >
            <InputLabel id="demo-simple-select-label">
              Expiration Dates
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Exp Date"
              onChange={(e: any) => setInputExp(e.target.value)}
            >
              {newList}
            </Select>
          </FormControl>
        </span>
        <span>
          <Button variant="contained" onClick={handleSearchGex}>
            Submit Expiration
          </Button>
        </span>
      </div>
      <div>
        <GexGraph
          stockPrice={stockPrice}
          callStrikes={callStrikes}
          putStrikes={putStrikes}
          callGEX={callGEX}
          putGEX={putGEX}
        />
      </div>
    </div>
  );
}

// setStockPrice(responseJson.curr_price)
//       setCallStrikes(responseJson.callStrikes)
//       setPutStrikes(responseJson.putStrikes)
//       setCallGEX(responseJson.callGEX)
//       setPutGEX(responseJson.putGEX)
export default GEX;
