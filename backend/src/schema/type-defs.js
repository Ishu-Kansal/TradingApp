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
    created_at: DateTime!
    updated_at: DateTime!
    type_ask: Boolean!
  }

  type Query {
    getAllBids: [Order]
    getAllAsks: [Order]

    getAllBidsActive: [Order]
    getAllAsksActive: [Order]

    getAllOrders: [Order]

    getBidsDesc: [Order]
    getAsksAsc: [Order]

    getOrder(id: ID!): Order

    getBidsByStockID(stock_id: Int!): [Order]
    getAsksByStockID(stock_id: Int!): [Order]
  }

  type Mutation {
    createOrderPopulate(
      user_id: Int!
      stock_id: Int!
      quantity: Int!
      limit_price: Float!
      status: Int!
      type_ask: Boolean!
    ): Order!

    deleteOrder(id: ID!): Order
  }
`;
export default typeDefs;
