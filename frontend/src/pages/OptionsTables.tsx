import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import Button from "@mui/material/Button/Button";
import TextField from "@mui/material/TextField/TextField";
import { useState } from "react";
import OptionsTable from "../components/OptionsTable";
import "../styles/OptionsTables.css";

function OptionsTables() {
  const handleSearchStock = async () => {
    const dataIn = { symbol: inputTicker };

    fetch("http://127.0.0.1:5500/options-exp", {
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

  const handleSearchOptions = async () => {
    const dataIn = { symbol: inputTicker, exp_date: inputExp };

    fetch("http://127.0.0.1:5500/options-calls", {
      method: "post",
      body: JSON.stringify(dataIn),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        setCallsList(responseJSON);
        return responseJSON;
      })
      .catch((error) => {
        console.log(error);
      });

    fetch("http://127.0.0.1:5500/options-puts", {
      method: "post",
      body: JSON.stringify(dataIn),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        setPutsList(responseJSON);
        return responseJSON;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const [inputTicker, setInputTicker] = useState("");
  const [inputExp, setInputExp] = useState("");
  const [expList, setExpList] = useState([]);
  const [callsList, setCallsList] = useState([]);
  const [putsList, setPutsList] = useState([]);

  const newList = expList.map((e) => <MenuItem value={e}>{e}</MenuItem>);

  return (
    <div className="home">
      <span>
        <Button variant="contained" href="/">
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
            handleSearchStock();
            handleSearchOptions();
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
            label="Age"
            onChange={(e: any) => setInputExp(e.target.value)}
          >
            {newList}
          </Select>
        </FormControl>
      </span>
      <span>
        <Button variant="contained" onClick={handleSearchOptions}>
          Submit Expiration
        </Button>
      </span>

      <h1>Calls:</h1>
      <div className="optionsTableCalls">
        <OptionsTable data={callsList} />
      </div>
      <h1>Puts:</h1>
      <div className="optionsTablePuts">
        <OptionsTable data={putsList} />
      </div>
    </div>
  );
}

export default OptionsTables;
