import db from "../../pgAdaptor.js";

export async function GetSelection(args) {
  const queryParams = `SELECT * FROM public."Orders" WHERE stock_id = ${
    args.stock_id
  } AND type_ask = ${!args.type_ask} AND limit_price ${
    args.type_ask ? ">=" : "<="
  } ${args.limit_price} AND (status = 1 OR status = 0) ORDER BY limit_price ${
    args.type_ask ? "DESC" : "ASC"
  }`;

  const selectPromise = db.any(queryParams);

  const listReturned = await selectPromise.then((data) => {
    console.log(data);
    return data;
  });

  return listReturned;
}
