import db from "../../pgAdaptor.js";
import GraphQLDate from "graphql-date";

const resolvers = {
  DateTime: GraphQLDate,
  Query: {
    allBids: () => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    allBidsActive: () => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    allAsks: () => {
      try {
        const asks = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = true`
        );
        return asks;
      } catch (err) {
        console.log(err);
      }
    },

    allAsksActive: () => {
      try {
        const asks = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = true AND status=0`
        );
        return asks;
      } catch (err) {
        console.log(err);
      }
    },

    allOrders: () => {
      try {
        const orders = db.any(`SELECT * FROM public."Orders"`);
        return orders;
      } catch (err) {
        console.log(err);
      }
    },

    bidsDesc: () => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0 ORDER BY limit_price DESC`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    asksAsc: () => {
      try {
        const asks = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = true AND status=0 ORDER BY limit_price ASC`
        );
        return asks;
      } catch (err) {
        console.log(err);
      }
    },

    order: (args) => {
      try {
        const order = db.any(
          `SELECT * FROM public."Orders" WHERE id= ${args.id}`
        );
        return order;
      } catch (err) {
        console.log(err);
      }
    },

    bidsByStockID: (args) => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0 AND stock_id= ${args.stock_id}`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    asksByStockID: (args) => {
      try {
        const asks = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = true AND status=0 AND stock_id= ${args.stock_id}`
        );
        return asks;
      } catch (err) {
        console.log(err);
      }
    },
  },

  Mutation: {
    createOrderPopulate: (parent, args) => {
      try {
        const createdOrder = db.any(
          `INSERT INTO public."Orders" (user_id, 
          stock_id,
          quantity,
          limit_price,
          status,
          type_ask)
           VALUES (${args.user_id},${args.stock_id}, ${args.quantity}, ${args.limit_price}, ${args.status}, ${args.type_ask})`
        );
        return args;
      } catch (err) {
        console.log(err);
      }
    },

    deleteOrder: (args) => {
      try {
        const deletedOrder = db.any(
          `SELECT * FROM public."Orders" WHERE id = ${args.id}`
        );
        db.any(`DELETE FROM public."Orders" WEHRE id = ${args.id}`);
        return deletedOrder;
      } catch (err) {
        console.log(err);
      }
    },
  },
};

export default resolvers;
