import db from "../../pgAdaptor.js";
import GraphQLDate from "graphql-date";
import { GetSelection } from "./helpers.js";
import moment from "moment/moment.js";

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

    allOrders: async () => {
      // try {
      //   const orders = db.any(`SELECT * FROM public."Orders"`);
      //   //console.log("Running....");
      //   console.log(orders);
      //   return orders;
      // } catch (err) {
      //   console.log(err);
      // }

      const orders = await db.any(
        `SELECT * FROM public."Orders" ORDER BY id ASC`
      );
      console.log(orders);
      return orders;
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

    order: (parent, args) => {
      try {
        const order = db.any(
          `SELECT * FROM public."Orders" WHERE id= ${args.id}`
        );
        return order;
      } catch (err) {
        console.log(err);
      }
    },

    bidsByStockID: (parent, args) => {
      try {
        const bids = db.any(
          `SELECT * FROM public."Orders" WHERE type_ask = false AND status=0 AND stock_id= ${args.stock_id}`
        );
        return bids;
      } catch (err) {
        console.log(err);
      }
    },

    asksByStockID: (parent, args) => {
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
      let id, created_at, updated_at;
      const createdOrder = db.any(
        `INSERT INTO public."Orders" (user_id, 
          stock_id,
          quantity,
          limit_price,
          status,
          type_ask)
          VALUES (${args.user_id},${args.stock_id}, ${args.quantity}, ${args.limit_price}, ${args.status}, ${args.type_ask})
          RETURNING id, created_at, updated_at;`
      );
      const newVal = createdOrder.then((data) => {
        id = data[0].id;
        created_at = data[0].created_at;
        updated_at = data[0].updated_at;
        console.log(data);
        return parseInt(id);
      });
      console.log("ret id: ", id);
      return newVal;
    },
    /*RESOLVE ASYNC PROBLEMS (CURRENTLY RETURNING -1 instead of ID) */

    createOrderFulfill: async (parent, args) => {
      let createdID = -1;
      console.log(args);

      const data = await GetSelection(args);

      let quantitySatisfied = 0;
      var currIndex = 0;
      console.log(0);
      console.log(data);
      console.log(1);
      while (quantitySatisfied < args.quantity && currIndex < data.length) {
        console.log("quant sat: ", quantitySatisfied);
        console.log("curr idx: ", data[currIndex]);
        //     //full satisfaction by index currIndex
        if (
          data[currIndex].quantity - data[currIndex].quantity_sat >
          args.quantity - quantitySatisfied
        ) {
          //       //list order is partially filled
          const listUpdate =
            await db.any(`UPDATE public."Orders" SET status = 1,
              quantity_sat = ${
                data[currIndex].quantity_sat +
                (args.quantity - quantitySatisfied)
              }
              WHERE id = ${data[currIndex].id}`);

          await db.none(`INSERT INTO public."FulfilledOrders" (stock_id, buyer_id, seller_id, quantity, price) VALUES (${
            args.stock_id
          }, ${args.type_ask ? data[currIndex].user_id : args.user_id}, 
            ${args.type_ask ? args.user_id : data[currIndex].user_id}, ${
            args.quantity - quantitySatisfied
          }, ${data[currIndex].limit_price})`);

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
              VALUES (${args.user_id},${args.stock_id}, ${args.quantity}, ${args.limit_price}, 2, ${args.type_ask}, ${args.quantity})
              RETURNING id, created_at, updated_at;`
          );

          console.log("created fulfilled order", insertedOrderFulfilled);
          createdID = insertedOrderFulfilled[0].id;

          quantitySatisfied = args.quantity;
        }

        //list stock quantity is equal to demanded quantity
        else if (
          data[currIndex].quantity - data[currIndex].quantity_sat ==
          args.quantity - quantitySatisfied
        ) {
          const listUpdate =
            await db.any(`UPDATE public."Orders" SET status = 2, quantity_sat = ${data[currIndex].quantity}
            WHERE id = ${data[currIndex].id}`);
          console.log("partially fulfilled existing order 2", listUpdate);

          await db.none(`INSERT INTO public."FulfilledOrders" (stock_id, buyer_id, seller_id, quantity, price) VALUES (${
            args.stock_id
          }, ${args.type_ask ? data[currIndex].user_id : args.user_id}, 
            ${args.type_ask ? args.user_id : data[currIndex].user_id}, ${
            args.quantity - quantitySatisfied
          }, ${data[currIndex].limit_price}, ${moment().format(
            "YYYY-MM-DD HH:mm:ss"
          )})`);

          const insertedOrderFulfilled = await db.any(
            `INSERT INTO public."Orders" (user_id,
                stock_id,
                quantity,
                limit_price,
                status,
                type_ask, quantity_sat)
                VALUES (${args.user_id},${args.stock_id}, ${args.quantity}, ${args.limit_price}, 2, ${args.type_ask}, ${args.quantity})
                RETURNING id, created_at, updated_at;`
          );
          console.log("created fulfilled order 2", insertedOrderFulfilled);
          createdID = insertedOrderFulfilled[0].id;
          quantitySatisfied = args.quantity;
        }
        //partial satisfaction by index currIndex
        else {
          const listUpdate =
            await db.any(`UPDATE public."Orders" SET status = 2, quantity_sat = ${data[currIndex].quantity}
              WHERE id = ${data[currIndex].id}`);

          await db.none(`INSERT INTO public."FulfilledOrders" (stock_id, buyer_id, seller_id, quantity, price) VALUES (${
            args.stock_id
          }, ${args.type_ask ? data[currIndex].user_id : args.user_id}, 
                ${args.type_ask ? args.user_id : data[currIndex].user_id}, ${
            data[currIndex].quantity
          }, ${data[currIndex].limit_price}, ${moment().format(
            "YYYY-MM-DD HH:mm:ss"
          )})`);

          console.log("fully fulfilled existing order", listUpdate);

          quantitySatisfied +=
            data[currIndex].quantity - data[currIndex].quantity_sat;
        }

        currIndex++;
      }

      if (currIndex == data.length && quantitySatisfied < args.quantity) {
        const insertedOrderFulfilled = await db.any(
          `INSERT INTO public."Orders" (user_id,
          stock_id,
          quantity,
          limit_price,
          status,
          type_ask, quantity_sat)
          VALUES (${args.user_id},${args.stock_id}, ${args.quantity}, ${args.limit_price}, 1, ${args.type_ask}, ${quantitySatisfied})
          RETURNING id, created_at, updated_at;`
        );
        console.log(
          "created partially fulfilled order",
          insertedOrderFulfilled
        );
        createdID = insertedOrderFulfilled[0].id;
      }
      return createdID;
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
