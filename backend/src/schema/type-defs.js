import { gql } from "apollo-server";
const typeDefs = gql`
  scalar DateTime

  type Order {
    id: ID!
    user_id: Int!
    stock_id: Int!
    quantity: Int
    limit_price: Float
    status: Int
    created_at: DateTime
    updated_at: DateTime
    type_ask: Boolean!
    quantity_sat: Int
  }

  type Query {
    allBids: [Order]
    allAsks: [Order]

    allBidsActive: [Order]
    allAsksActive: [Order]

    allOrders: [Order]

    bidsDesc: [Order]
    asksAsc: [Order]

    order(id: ID!): Order

    bidsByStockID(stock_id: Int!): [Order]
    asksByStockID(stock_id: Int!): [Order]
  }

  type Mutation {
    createOrderPopulate(
      user_id: Int!
      stock_id: Int!
      quantity: Int!
      limit_price: Float!
      status: Int!
      type_ask: Boolean!
    ): ID!

    createOrderFulfill(
      user_id: Int!
      stock_id: Int!
      quantity: Int!
      limit_price: Float!
      type_ask: Boolean!
    ): ID!

    deleteOrder(id: ID!): Order
  }
`;
export default typeDefs;
