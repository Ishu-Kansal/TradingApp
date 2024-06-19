import TableCell from "@mui/material/TableCell/TableCell";
import moment from "moment";
import React from "react";
import { useNavigate } from "react-router-dom";

function OptionsTableRow({ row }) {
  const navigate = useNavigate();

  const toContract = () => {
    console.log(row);
    navigate(`/${row.contractSymbol}`, {
      state: { content: row },
    });
  };

  return (
    <>
      <TableCell component="th" scope="row">
        <a
          href="javascript:void(0)"
          onClick={() => {
            toContract();
          }}
        >
          <b>{row.contractSymbol}</b>
        </a>
      </TableCell>
      <TableCell align="center">
        {String(moment(row.lastTradeDate).format("MM/DD/YYYY\t h:mm A"))}
      </TableCell>
      <TableCell align="center">
        <b>{row.strike}</b>
      </TableCell>
      <TableCell align="center">{row.lastPrice}</TableCell>
      <TableCell align="right">{row.bid === 0 ? "0.00" : row.bid}</TableCell>
      <TableCell align="right">{row.ask === 0 ? "0.00" : row.ask}</TableCell>
      <TableCell align="center">
        {row.change === 0 ? "0.00" : Math.round(row.change * 100) / 100}
      </TableCell>
      <TableCell align="center">
        {Math.round(row.percentChange * 10) / 10}%
      </TableCell>
      <TableCell align="center">
        {row.volume === null ? "-" : row.volume}
      </TableCell>
      <TableCell align="center">{row.openInterest}</TableCell>
      <TableCell align="center">
        {Math.round(row.impliedVolatility * 10000) / 100}%
      </TableCell>
    </>
  );
}

export default OptionsTableRow;
