import db from "./pgAdaptor.js";

await validateDB();

export async function validateDB() {
  var isValid = true;
  for (let i = 1; i <= 5; i++) {
    const bids = await getBidsForStock(i);
    const asks = await getAsksForStock(i);

    if (
      bids.length > 0 &&
      asks.length > 0 &&
      bids[0].limit_price >= asks[0].limit_price
    ) {
      // console.log(`SOMETHING WRONG WITH STOCK ${i}`);
      isValid = false;
    } else {
      // console.log(`STOCK ${i} IS GUD`);
    }
  }

  return isValid;
}

async function getBidsForStock(stock_id) {
  try {
    const bids = await db.any(
      `SELECT * FROM public."Orders" WHERE stock_id= ${stock_id} AND type_ask = false AND (status = 0 or status = 1) ORDER BY limit_price DESC`
    );

    return bids;
  } catch (err) {
    console.log(err);
  }
}

async function getAsksForStock(stock_id) {
  try {
    const asks = await db.any(
      `SELECT * FROM public."Orders" WHERE stock_id= ${stock_id} AND type_ask = true AND (status = 0 or status = 1)  ORDER BY limit_price ASC`
    );

    return asks;
  } catch (err) {
    console.log(err);
  }
}
