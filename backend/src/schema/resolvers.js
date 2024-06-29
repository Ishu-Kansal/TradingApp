import db from "../../pgAdaptor.js";
import GraphQLDate from "graphql-date";
import { GetSelection } from "./helpers.js";

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
      // try {
      //   const orders = db.any(`SELECT * FROM public."Orders"`);
      //   //console.log("Running....");
      //   console.log(orders);
      //   return orders;
      // } catch (err) {
      //   console.log(err);
      // }

      const orders = db.any(`SELECT * FROM public."Orders"`);
      const list = orders.then((data) => {
        console.log(data);
        return data;
      });
      return list;
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
    createOrderFulfill: (parent, args) => {
      let createdID = -1;
      console.log(args);

      const listReturned = GetSelection(args);

      const returnedID = listReturned.then((data) => {
        let quantitySatisfied = 0;
        var currIndex = 0;
        console.log("args quantity: ", args.quantity);
        console.log("curr idx before: ", data[currIndex]);
        while (quantitySatisfied < args.quantity || currIndex < data.length) {
          console.log("curr idx: ", data[currIndex]);
          //full satisfaction by index currIndex
          if (
            data[currIndex].quantity - data[currIndex].quantity_sat >
            args.quantity - quantitySatisfied
          ) {
            //list order is partially filled
            const listUpdate = db.any(`UPDATE public."Orders" SET status = 1, 
          quantity_sat = ${
            data[currIndex].quantity_sat + (args.quantity - quantitySatisfied)
          }
          WHERE id = ${data[currIndex].id}`);

            listUpdate.then((data) =>
              console.log("partially fulfilled existing order 1", data)
            );

            //inserted order is fully filled
            const insertedOrderFulfilled = db.any(
              `INSERT INTO public."Orders" (user_id, 
              stock_id,
              quantity,
              limit_price,
              status,
              type_ask, quantity_sat)
              VALUES (${args.user_id},${args.stock_id}, ${args.quantity}, ${args.limit_price}, 2, ${args.type_ask}, ${args.quantity})
              RETURNING id, created_at, updated_at;`
            );
            insertedOrderFulfilled.then((data) => {
              console.log("created fulfilled order", data);
              createdID = data[0].id;
            });

            quantitySatisfied = args.quantity;
          }
          //list stock quantity is equal to demanded quantity
          else if (
            data[currIndex].quantity - data[currIndex].quantity_sat ==
            args.quantity - quantitySatisfied
          ) {
            const listUpdate =
              db.any(`UPDATE public."Orders" SET status = 2, quantity_sat = ${data[currIndex].quantity}
          WHERE id = ${data[currIndex].id}`);
            listUpdate.then((data) =>
              console.log("partially fulfilled existing order", data)
            );

            const insertedOrderFulfilled = db.any(
              `INSERT INTO public."Orders" (user_id, 
              stock_id,
              quantity,
              limit_price,
              status,
              type_ask, quantity_sat)
              VALUES (${args.user_id},${args.stock_id}, ${args.quantity}, ${args.limit_price}, 2, ${args.type_ask}, ${args.quantity})
              RETURNING id, created_at, updated_at;`
            );
            insertedOrderFulfilled.then((data) => {
              console.log("created fulfilled order", data);
              createdID = data[0].id;
            });
            quantitySatisfied = args.quantity;
          }
          //partial satisfaction by index currIndex
          else {
            const listUpdate =
              db.any(`UPDATE public."Orders" SET status = 2, quantity_sat = ${data[currIndex].quantity}
            WHERE id = ${data[currIndex].id}`);

            listUpdate.then((data) =>
              console.log("fully fulfilled existing order", data)
            );

            quantitySatisfied +=
              data[currIndex].quantity - data[currIndex].quantity_sat;
          }

          currIndex++;
        }

        if (currIndex == data.length && quantitySatisfied < args.quantity) {
          const insertedOrderFulfilled = db.any(
            `INSERT INTO public."Orders" (user_id, 
            stock_id,
            quantity,
            limit_price,
            status,
            type_ask, quantity_sat)
            VALUES (${args.user_id},${args.stock_id}, ${args.quantity}, ${args.limit_price}, 2, ${args.type_ask}, ${quantitySatisfied})
            RETURNING id, created_at, updated_at;`
          );
          insertedOrderFulfilled.then((data) => {
            console.log("created partially fulfilled order", data);
            createdID = data[0].id;
          });

          return createdID;
        }
      });

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
