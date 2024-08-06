import { PriorityQueue } from "@datastructures-js/priority-queue";

export let StockMap = new Map();

var currentIndex = 1;

export function setIndex(latestIndex) {
  currentIndex = latestIndex;
}

for (let i = 1; i <= 5; i++) {
  const bidsQueue = new PriorityQueue((a, b) => {
    if (a.limit_price > b.limit_price) {
      return -1;
    }
    if (a.limit_price < b.limit_price) {
      return 1;
    }
    return a.created_at > b.created_at ? 1 : -1;
  });
  const asksQueue = new PriorityQueue((a, b) => {
    if (a.limit_price < b.limit_price) {
      return -1;
    }
    if (a.limit_price > b.limit_price) {
      return 1;
    }
    return a.created_at > b.created_at ? 1 : -1;
  });
  StockMap[i] = { bidsQueue, asksQueue };
}

export function addBid(stockID, bid) {
  StockMap[stockID].bidsQueue.enqueue(bid);
}

export function addAsk(stockID, ask) {
  StockMap[stockID].asksQueue.enqueue(ask);
}

export function addBidStartup(stockID, bid) {
  StockMap[stockID].bidsQueue.enqueue(bid);
}

export function addAskStartup(stockID, ask) {
  StockMap[stockID].asksQueue.enqueue(ask);
}

export function incrementCurrentIndex() {
  currentIndex++;
}

export function setCurrentIndex(index) {
  currentIndex = index;
}

export function getCurrentIndex() {
  return currentIndex;
}

export function printQueueState(stock_id) {
  return {
    bidList: StockMap[stock_id].bidsQueue?.toArray(),
    askList: StockMap[stock_id].asksQueue?.toArray(),
  };
}
