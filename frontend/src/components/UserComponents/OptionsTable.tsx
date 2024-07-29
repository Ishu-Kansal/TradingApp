import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
} from "@mui/material";
import OptionsTableRow from "./OptionsTableRow.tsx";

function OptionsTable(props) {
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    backgroundColor: "rgba(179, 255, 230, 0.85)",
    "&:last-child": {
      borderBottom: "5px solid black",
    },
    "&:first-child": {
      borderTop: "5px solid black",
    },
  }));
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Contract Name</TableCell>
            <TableCell align="right">Last Trade Date (EDT)</TableCell>
            <TableCell align="right">Strike</TableCell>
            <TableCell align="right">Last Price</TableCell>
            <TableCell align="right">Bid</TableCell>
            <TableCell align="right">Ask</TableCell>
            <TableCell align="right">Change</TableCell>
            <TableCell align="right">% Change</TableCell>
            <TableCell align="right">Volume</TableCell>
            <TableCell align="right">Open Interest</TableCell>
            <TableCell align="right">Implied Volatility</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((row) =>
            row.inTheMoney ? (
              <StyledTableRow
                key={row.contractSymbol}
                sx={{
                  border: 0,
                  borderLeft: 1,
                  borderLeftColor: "rgb(0, 230, 153)",
                  borderLeftWidth: "5px",
                }}
              >
                <OptionsTableRow row={row} exp={props.exp} />
              </StyledTableRow>
            ) : (
              <TableRow
                key={row.contractSymbol}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <OptionsTableRow row={row} exp={props.exp} />
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default OptionsTable;
