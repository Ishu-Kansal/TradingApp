import db from "../../pgAdaptor.js";

/*EXPERIMENTAL MIGRATION OF QUERIES FROM GQL TO REST */

export async function getBids(req, res, next) {
  try {
    const bids = await db.any(
      `SELECT * FROM public."Orders" WHERE type_ask = false`
    );
    res.status(200).json({
      status: "success",
      data: bids,
      message: "retrieved all bids",
    });
    return bids;
  } catch (err) {
    console.log(err);
  }
}

export function getAllBidsActive(req, res, next) {
  try {
    const bids = db.any(
      `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0`
    );

    res.status(200).json({
      status: "success",
      data: bids,
      message: "retrieved all active bids",
    });
  } catch (err) {
    console.log(err);
  }
}

export function allAsks(req, res, next) {
  try {
    const asks = db.any(`SELECT * FROM public."Orders" WHERE type_ask = true`);
    res.status(200).json({
      status: "success",
      data: asks,
      message: "retrieved all asks",
    });
    return asks;
  } catch (err) {
    console.log(err);
  }
}

export function allAsksActive(req, res, next) {
  try {
    const asks = db.any(
      `SELECT * FROM public."Orders" WHERE type_ask = true AND status=0`
    );
    res.status(200).json({
      status: "success",
      data: asks,
      message: "retrieved all asks active",
    });
    return asks;
  } catch (err) {
    console.log(err);
  }
}

export async function allOrders(req, res, next) {
  try {
    const orders = await db.any(
      `SELECT * FROM public."Orders" ORDER BY id ASC`
    );
    res.status(200).json({
      status: "success",
      data: orders,
      message: "retrieved all bids",
    });
    console.log(orders);
    return orders;
  } catch (error) {
    console.log(error);
    res.status(503).json({
      status: "error",
      message: "error with query or database",
    });
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await db.any(
      `SELECT * FROM public."Orders" WHERE id= ${req.params.id}`
    );
    res.status(200).json({
      status: "success",
      data: order,
      message: `retrieved order with id ${req.params.id}`,
    });
    return order;
  } catch (err) {
    console.log(err);
  }
}
import db from "../../pgAdaptor.js";
import { GetSelection } from "../schema/helpers.js";
/*EXPERIMENTAL MIGRATION OF QUERIES FROM GQL TO REST */

export async function getBids(req, res, next) {
  try {
    const bids = await db.any(
      `SELECT * FROM public."Orders" WHERE type_ask = false`
    );
    res.status(200).json({
      status: "success",
      data: bids,
      message: "retrieved all bids",
    });
    return bids;
  } catch (err) {
    console.log(err);
  }
}

export function getAllBidsActive(req, res, next) {
  try {
    const bids = db.any(
      `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0`
    );

    res.status(200).json({
      status: "success",
      data: bids,
      message: "retrieved all active bids",
    });
  } catch (err) {
    console.log(err);
  }
}

export function allAsks(req, res, next) {
  try {
    const asks = db.any(`SELECT * FROM public."Orders" WHERE type_ask = true`);
    res.status(200).json({
      status: "success",
      data: asks,
      message: "retrieved all asks",
    });
    return asks;
  } catch (err) {
    console.log(err);
  }
}

export function allAsksActive(req, res, next) {
  try {
    const asks = db.any(
      `SELECT * FROM public."Orders" WHERE type_ask = true AND status=0`
    );
    res.status(200).json({
      status: "success",
      data: asks,
      message: "retrieved all asks active",
    });
    return asks;
  } catch (err) {
    console.log(err);
  }
}

export async function allOrders(req, res, next) {
  try {
    const orders = await db.any(
      `SELECT * FROM public."Orders" ORDER BY id ASC`
    );
    res.status(200).json({
      status: "success",
      data: bids,
      message: "retrieved all bids",
    });
    console.log(orders);
    return orders;
  } catch (error) {
    console.log(error);
    res.status(503).json({
      status: "error",
      message: "error with query or database",
    });
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await db.any(
      `SELECT * FROM public."Orders" WHERE id= ${req.params.id}`
    );
    res.status(200).json({
      status: "success",
      data: order,
      message: `retrieved order with id ${req.params.id}`,
    });
    return order;
  } catch (err) {
    console.log(err);
  }
}

export async function createOrderFulfill(req, res) {
  let createdID = -1;
  let newTransaction = -1;
  let transactionsCreated = [];
  console.log("body: ", req.body, "\n\n\n");

  const data = await GetSelection(req.body);

  let quantitySatisfied = 0;
  var currIndex = 0;
  console.log(0);
  console.log(data);
  console.log(1);
  while (quantitySatisfied < req.body.quantity && currIndex < data.length) {
    console.log("quant sat: ", quantitySatisfied);
    console.log("curr idx: ", data[currIndex]);
    //     //full satisfaction by index currIndex
    if (
      data[currIndex].quantity - data[currIndex].quantity_sat >
      req.body.quantity - quantitySatisfied
    ) {
      //       //list order is partially filled
      const listUpdate = await db.any(`UPDATE public."Orders" SET status = 1,
              quantity_sat = ${
                data[currIndex].quantity_sat +
                (req.body.quantity - quantitySatisfied)
              }
              WHERE id = ${data[currIndex].id}`);

      newTransaction =
        await db.any(`INSERT INTO public."FulfilledOrders" (stock_id, buyer_id, seller_id, quantity, price) VALUES (${
          req.body.stock_id
        }, ${req.body.type_ask ? data[currIndex].user_id : req.body.user_id}, 
            ${
              req.body.type_ask ? req.body.user_id : data[currIndex].user_id
            }, ${req.body.quantity - quantitySatisfied}, ${
          data[currIndex].limit_price
        }) RETURNING id`);
      transactionsCreated.push(newTransaction);

      console.log(
        "partially fulfilled existing order 1",
        JSON.stringify(listUpdate)
      );

      //       //inserted order is fully filled
      const insertedOrderFulfilled = await db.any(
        `INSERT INTO public."Orders" (user_id,
              stock_id,
              quantity,
              limit_price,
              status,
              type_ask, quantity_sat)
              VALUES (${req.body.user_id},${req.body.stock_id}, ${req.body.quantity}, ${req.body.limit_price}, 2, ${req.body.type_ask}, ${req.body.quantity})
              RETURNING id, created_at, updated_at;`
      );

      console.log("created fulfilled order", insertedOrderFulfilled);
      createdID = insertedOrderFulfilled[0].id;

      quantitySatisfied = req.body.quantity;
    }

    //list stock quantity is equal to demanded quantity
    else if (
      data[currIndex].quantity - data[currIndex].quantity_sat ==
      req.body.quantity - quantitySatisfied
    ) {
      const listUpdate =
        await db.any(`UPDATE public."Orders" SET status = 2, quantity_sat = ${data[currIndex].quantity}
            WHERE id = ${data[currIndex].id}`);
      console.log("partially fulfilled existing order 2", listUpdate);

      newTransaction =
        await db.any(`INSERT INTO public."FulfilledOrders" (stock_id, buyer_id, seller_id, quantity, price) VALUES (${
          req.body.stock_id
        }, ${req.body.type_ask ? data[currIndex].user_id : req.body.user_id}, 
            ${
              req.body.type_ask ? req.body.user_id : data[currIndex].user_id
            }, ${req.body.quantity - quantitySatisfied}, ${
          data[currIndex].limit_price
        }) RETURNING id`);
      transactionsCreated.push(newTransaction);

      const insertedOrderFulfilled = await db.any(
        `INSERT INTO public."Orders" (user_id,
                stock_id,
                quantity,
                limit_price,
                status,
                type_ask, quantity_sat)
                VALUES (${req.body.user_id},${req.body.stock_id}, ${req.body.quantity}, ${req.body.limit_price}, 2, ${req.body.type_ask}, ${req.body.quantity})
                RETURNING id, created_at, updated_at;`
      );
      console.log("created fulfilled order 2", insertedOrderFulfilled);
      createdID = insertedOrderFulfilled[0].id;
      quantitySatisfied = req.body.quantity;
    }
    //partial satisfaction by index currIndex
    else {
      const listUpdate =
        await db.any(`UPDATE public."Orders" SET status = 2, quantity_sat = ${data[currIndex].quantity}
              WHERE id = ${data[currIndex].id}`);

      newTransaction =
        await db.any(`INSERT INTO public."FulfilledOrders" (stock_id, buyer_id, seller_id, quantity, price) VALUES (${
          req.body.stock_id
        }, ${req.body.type_ask ? data[currIndex].user_id : req.body.user_id}, 
            ${
              req.body.type_ask ? req.body.user_id : data[currIndex].user_id
            }, ${data[currIndex].quantity}, ${
          data[currIndex].limit_price
        }) RETURNING id`);
      transactionsCreated.push(newTransaction);

      console.log("fully fulfilled existing order", listUpdate);

      quantitySatisfied +=
        data[currIndex].quantity - data[currIndex].quantity_sat;
    }

    currIndex++;
  }

  if (currIndex == data.length && quantitySatisfied < req.body.quantity) {
    const insertedOrderFulfilled = await db.any(
      `INSERT INTO public."Orders" (user_id,
          stock_id,
          quantity,
          limit_price,
          status,
          type_ask, quantity_sat)
          VALUES (${req.body.user_id},${req.body.stock_id}, ${
        req.body.quantity
      }, ${req.body.limit_price}, ${quantitySatisfied == 0 ? 0 : 1}, ${
        req.body.type_ask
      }, ${quantitySatisfied})
          RETURNING id, created_at, updated_at;`
    );
    console.log("created partially fulfilled order", insertedOrderFulfilled);
    createdID = insertedOrderFulfilled[0].id;
  }
  res.status(200).json({ createdID, transactions: transactionsCreated });
}
