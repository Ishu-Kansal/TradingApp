import TableCell from "@mui/material/TableCell/TableCell";
import moment from "moment";
import { useNavigate } from "react-router-dom";

function OptionsTableRow(props) {
  const navigate = useNavigate();

  const toContract = () => {
    console.log(props.row);
    navigate(`/${props.row.contractSymbol}`, {
      state: { content: props.row, exp: props.exp },
    });
  };

  return (
    <>
      <TableCell component="th" scope="props.row">
        <a
          href="javascript:void(0)"
          onClick={() => {
            toContract();
          }}
        >
          <b>{props.row.contractSymbol}</b>
        </a>
      </TableCell>
      <TableCell align="center">
        {String(moment(props.row.lastTradeDate).format("MM/DD/YYYY\t h:mm A"))}
      </TableCell>
      <TableCell align="center">
        <b>{props.row.strike}</b>
      </TableCell>
      <TableCell align="center">{props.row.lastPrice}</TableCell>
      <TableCell align="right">
        {props.row.bid === 0 ? "0.00" : props.row.bid}
      </TableCell>
      <TableCell align="right">
        {props.row.ask === 0 ? "0.00" : props.row.ask}
      </TableCell>
      <TableCell align="center">
        {props.row.change === 0
          ? "0.00"
          : Math.round(props.row.change * 100) / 100}
      </TableCell>
      <TableCell align="center">
        {Math.round(props.row.percentChange * 10) / 10}%
      </TableCell>
      <TableCell align="center">
        {props.row.volume === null ? "-" : props.row.volume}
      </TableCell>
      <TableCell align="center">{props.row.openInterest}</TableCell>
      <TableCell align="center">
        {Math.round(props.row.impliedVolatility * 10000) / 100}%
      </TableCell>
    </>
  );
}

export default OptionsTableRow;
