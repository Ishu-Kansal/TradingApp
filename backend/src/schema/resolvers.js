import db from "../../pgAdaptor.js";
import GraphQLDate from "graphql-date";

const resolvers = {
  DateTime: GraphQLDate,
  Query: {
    getAllBids: (parent, args) => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    getAllBidsActive: (parent, args) => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    getAllAsks: (parent, args) => {
      try {
        const asks = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = true`
        );
        return asks;
      } catch (err) {
        console.log(err);
      }
    },

    getAllAsksActive: (parent, args) => {
      try {
        const asks = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = true AND status=0`
        );
        return asks;
      } catch (err) {
        console.log(err);
      }
    },

    getAllOrders: (parent, args) => {
      try {
        const orders = db.any(`SELECT * FROM public."Orders"`);
        return orders;
      } catch (err) {
        console.log(err);
      }
    },

    getBidsDesc: (parent, args) => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0 ORDER BY limit_price DESC`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    getAsksAsc: (parent, args) => {
      try {
        const asks = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = true AND status=0 ORDER BY limit_price ASC`
        );
        return asks;
      } catch (err) {
        console.log(err);
      }
    },

    getOrder: (parent, args) => {
      try {
        const order = db.any(
          `SELECT * FROM public."Orders" WHERE id= ${args.id}`
        );
        return order;
      } catch (err) {
        console.log(err);
      }
    },

    getBidsByStockID: (parent, args) => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0 AND stock_id= ${args.stock_id}`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    getAsksByStockID: (parent, args) => {
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
  },
};

export default resolvers;
