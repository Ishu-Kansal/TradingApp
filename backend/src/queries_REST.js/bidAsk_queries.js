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
