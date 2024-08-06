import {
  addBid,
  StockMap,
  addAsk,
  setCurrentIndex,
  addBidStartup,
  addAskStartup,
  getCurrentIndex,
} from "./Queue.js";
import db from "../../pgAdaptor.js";

export async function Startup() {
  let finalIndex = await getLastIndex();
  if (isNaN(parseInt(finalIndex[0].max) + 1)) {
    setCurrentIndex(1);
  } else {
    setCurrentIndex(parseInt(finalIndex[0].max) + 1);
  }

  console.log("curr idx: ", getCurrentIndex());

  for (let i = 1; i <= 5; i++) {
    const bids = await getBidsActiveStockID(i);
    const asks = await getAsksActiveStockID(i);

    // console.log("bids: ", bids);
    // console.log("asks: ", asks);

    bids.map((bid) => {
      addBidStartup(i, bid);
    });

    asks.map((ask) => {
      addAskStartup(i, ask);
    });
  }
  //addBid(1, { limit_price: 10, created_at: 5 });
  //   console.log(StockMap[1].bidsQueue.front());

  for (let i = 1; i <= 5; i++) {
    console.log(`Map for stock ${i}: {
        ${JSON.stringify(StockMap[i].bidsQueue.toArray())}, 
        ${JSON.stringify(StockMap[i].asksQueue.toArray())}
    }`);
  }
}

async function getBidsActiveStockID(stockID) {
  try {
    const bids = await db.any(
      `SELECT * FROM public."Orders" WHERE type_ask = false AND (status=0 OR status = 1) AND stock_id = ${stockID} ORDER BY limit_price DESC`
    );
    return bids;
  } catch (err) {
    console.log(err);
  }
}

async function getAsksActiveStockID(stockID) {
  try {
    const asks = await db.any(
      `SELECT * FROM public."Orders" WHERE type_ask = true AND (status=0 OR status = 1) AND stock_id = ${stockID} ORDER BY limit_price ASC`
    );
    return asks;
  } catch (err) {
    console.log(err);
  }
}

async function getLastIndex() {
  try {
    const id = await db.any(`SELECT MAX(id) FROM public."Orders"`);
    return id;
  } catch (err) {
    console.log(err);
  }
}
