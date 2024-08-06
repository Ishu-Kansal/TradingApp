import {
  addAsk,
  addBid,
  StockMap,
  getCurrentIndex,
  addBidStartup,
  addAskStartup,
  incrementCurrentIndex,
} from "../Queuing/Queue.js";
import db from "../../pgAdaptor.js";
import moment from "moment/moment.js";

export function createOrderFulfillQueue(req, res) {
  const startTime = performance.now();
  let createdID = -1;
  let newTransaction = -1;
  let transactionsCreated = [];
  // console.log("body: ", req.body, "\n\n\n");

  //const data = await GetSelection(req.body);
  const data = req.body.type_ask
    ? StockMap[req.body.stock_id].bidsQueue?.toArray()
    : StockMap[req.body.stock_id].asksQueue?.toArray();

  const promisesToResolve = [];
  let quantitySatisfied = 0;
  var currIndex = 0;
  // console.log(0);
  console.log("data: ", data);
  // console.log(1);

  const stock_id = req.body.stock_id;

  while (quantitySatisfied < req.body.quantity && currIndex < data.length) {
    // console.log("quant sat: ", quantitySatisfied);
    // console.log("curr idx: ", data[currIndex]);

    /* CURRENT INDEX CAN SATISFY PLACED ORDER */
    if (
      data[currIndex].quantity - data[currIndex].quantity_sat >=
      req.body.quantity - quantitySatisfied
    ) {
      const bothFilled =
        data[currIndex].quantity - data[currIndex].quantity_sat ==
        req.body.quantity - quantitySatisfied;
      console.log("current index fills order, both filled: ", bothFilled);
      const listUpdate = db
        .any(
          `UPDATE public."Orders" SET status = ${bothFilled ? 2 : 1},
                quantity_sat = ${
                  data[currIndex].quantity_sat +
                  (req.body.quantity - quantitySatisfied)
                }
                WHERE id = ${data[currIndex].id}`
        )
        .then((ret) =>
          console.log("partially fulfilled existing order 1", ret)
        );

      promisesToResolve.push(listUpdate);

      const filledTransaction = req.body.type_ask
        ? StockMap[req.body.stock_id].bidsQueue.pop()
        : StockMap[req.body.stock_id].asksQueue.pop();

      if (!bothFilled) {
        filledTransaction.quantity_sat =
          filledTransaction.quantity_sat +
          (req.body.quantity - quantitySatisfied);

        filledTransaction.status = 1;

        if (filledTransaction.type_ask) {
          addAskStartup(stock_id, filledTransaction);
        } else {
          addBidStartup(stock_id, filledTransaction);
        }
      }

      newTransaction = db
        .any(
          `INSERT INTO public."FulfilledOrders" (stock_id, buyer_id, seller_id, quantity, price) VALUES (${
            req.body.stock_id
          }, ${req.body.type_ask ? data[currIndex].user_id : req.body.user_id}, 
            ${
              req.body.type_ask ? req.body.user_id : data[currIndex].user_id
            }, ${req.body.quantity - quantitySatisfied}, ${
            data[currIndex].limit_price
          }) RETURNING id`
        )
        .then((ret) => transactionsCreated.push(ret));
      promisesToResolve.push(newTransaction);

      const indexToInsert = getCurrentIndex();
      console.log("Inserting at id: ", indexToInsert, "\n\n\n\n");
      incrementCurrentIndex();

      if (req.body.type_ask) {
        addAsk(stock_id, {
          user_id: req.body.user_id,
          stock_id: req.body.stock_id,
          quantity: req.body.quantity,
          limit_price: req.body.limit_price,
          status: bothFilled ? 2 : 1,
          created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          type_ask: req.body.type_ask,
          quantity_sat: req.body.quantity - quantitySatisfied,
          id: indexToInsert,
        });
      } else {
        addBid(stock_id, {
          user_id: req.body.user_id,
          stock_id: req.body.stock_id,
          quantity: req.body.quantity,
          limit_price: req.body.limit_price,
          status: bothFilled ? 2 : 1,
          created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
          type_ask: req.body.type_ask,
          quantity_sat: req.body.quantity - quantitySatisfied,
          id: indexToInsert,
        });
      }

      //       //inserted order is fully filled
      const insertedOrderFulfilled = db
        .any(
          `INSERT INTO public."Orders" (id, user_id,
              stock_id,
              quantity,
              limit_price,
              status,
              type_ask, quantity_sat)
              VALUES (${indexToInsert},${req.body.user_id},${req.body.stock_id}, ${req.body.quantity}, ${req.body.limit_price}, 2, ${req.body.type_ask}, ${req.body.quantity})
              RETURNING id, created_at, updated_at;`
        )
        .then((ret) => {
          console.log("created fulfilled order", ret);
          createdID = ret[0].id;
          res
            .status(200)
            .json({ createdID, transactions: transactionsCreated });
        });
      promisesToResolve.push(insertedOrderFulfilled);

      quantitySatisfied = req.body.quantity;
      break;
    }

    //requested quantity is greater than current index quantity
    else if (req.body.quantity - quantitySatisfied != 0) {
      const filledTransaction = req.body.type_ask
        ? StockMap[req.body.stock_id].bidsQueue.pop()
        : StockMap[req.body.stock_id].asksQueue.pop();

      const listUpdate = db
        .any(
          `UPDATE public."Orders" SET status = 2, quantity_sat = ${data[currIndex].quantity}
              WHERE id = ${data[currIndex].id}`
        )
        .then((ret) => {
          console.log("fully fulfilled existing order", ret);
        });
      promisesToResolve.push(listUpdate);
      newTransaction = db
        .any(
          `INSERT INTO public."FulfilledOrders" (stock_id, buyer_id, seller_id, quantity, price) VALUES (${
            req.body.stock_id
          }, ${req.body.type_ask ? data[currIndex].user_id : req.body.user_id}, 
            ${
              req.body.type_ask ? req.body.user_id : data[currIndex].user_id
            }, ${data[currIndex].quantity}, ${
            data[currIndex].limit_price
          }) RETURNING id`
        )
        .then((retVal) => {
          transactionsCreated.push(retVal);
        });

      promisesToResolve.push(newTransaction);

      quantitySatisfied +=
        data[currIndex].quantity - data[currIndex].quantity_sat;
    }

    currIndex++;
  }

  if (currIndex == data.length && quantitySatisfied < req.body.quantity) {
    const indexToInsert = getCurrentIndex();
    incrementCurrentIndex();
    const insertedOrderFulfilled = db
      .any(
        `INSERT INTO public."Orders" (id, user_id,
          stock_id,
          quantity,
          limit_price,
          status,
          type_ask, quantity_sat)
          VALUES (${indexToInsert}, ${req.body.user_id},${req.body.stock_id}, ${
          req.body.quantity
        }, ${req.body.limit_price}, ${quantitySatisfied == 0 ? 0 : 1}, ${
          req.body.type_ask
        }, ${quantitySatisfied})
          RETURNING id, created_at, updated_at;`
      )
      .then((ret) => {
        console.log("created partially fulfilled order", ret);

        createdID = ret[0].id;
        res.status(200).json({ createdID, transactions: transactionsCreated });
      });

    promisesToResolve.push(insertedOrderFulfilled);

    if (req.body.type_ask) {
      addAsk(stock_id, {
        user_id: req.body.user_id,
        stock_id: req.body.stock_id,
        quantity: req.body.quantity,
        limit_price: req.body.limit_price,
        status: quantitySatisfied == 0 ? 0 : 1,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        type_ask: req.body.type_ask,
        quantity_sat: quantitySatisfied,
        id: indexToInsert,
      });
    } else {
      addBid(stock_id, {
        user_id: req.body.user_id,
        stock_id: req.body.stock_id,
        quantity: req.body.quantity,
        limit_price: req.body.limit_price,
        status: quantitySatisfied == 0 ? 0 : 1,
        created_at: moment().format("YYYY-MM-DD HH:mm:ss"),
        type_ask: req.body.type_ask,
        quantity_sat: quantitySatisfied,
        id: indexToInsert,
      });
    }
  }
  const endTime = performance.now();

  console.log(`/*Runtime:  ${endTime - startTime} milliseconds  */`);
  Promise.all(promisesToResolve).then((result) =>
    console.log(console.log("/*Results: ", result, "   */\n\n"))
  );
}
