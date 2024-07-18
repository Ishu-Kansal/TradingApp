import db from "../../pgAdaptor.js";

export async function GetSelection(args) {
  console.log(args);
  const queryParams = `SELECT * FROM public."Orders" WHERE stock_id = ${
    args.stock_id
  } AND type_ask = ${!args.type_ask} AND limit_price ${
    args.type_ask ? ">=" : "<="
  } ${args.limit_price} AND (status = 1 OR status = 0) ORDER BY limit_price ${
    args.type_ask ? "DESC" : "ASC"
  }`;

  const listReturned = await db.any(queryParams);

  return listReturned;
}
