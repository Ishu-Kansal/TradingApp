import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

function BidAskOrdersTable(rows) {
  console.log("rows: ", rows);
  return (
    <TableContainer>
      <TableHead>
        <TableRow>
          <TableCell>Order ID</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>User ID</TableCell>
          <TableCell>Stock ID</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Limit Price</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Quantity Satisfied</TableCell>
          <TableCell>Created At</TableCell>
          <TableCell>Updated At</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.type_ask ? "Ask" : "Buy"}</TableCell>
            <TableCell>{row.user_id}</TableCell>
            <TableCell>{row.stock_id}</TableCell>
            <TableCell>{row.quantity}</TableCell>
            <TableCell>{row.limit_price}</TableCell>
            <TableCell>{row.status}</TableCell>
            <TableCell>{row.quantity_sat}</TableCell>
            <TableCell>{row.created_at}</TableCell>
            <TableCell>{row.updated_at}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableContainer>
  );
}

export default BidAskOrdersTable;
