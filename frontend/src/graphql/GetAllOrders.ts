import { gql } from "@apollo/client";

const GetAllOrders = gql`
  query GetAllOrders {
    allOrders {
      id
      user_id
      stock_id
      quantity
      limit_price
      status
      created_at
      updated_at
      type_ask
      quantity_sat
    }
  }
`;

export default GetAllOrders;
