import { gql } from "@apollo/client";

export var GetAllOrders = gql`
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
    }
  }
`;
export default GetAllOrders;
