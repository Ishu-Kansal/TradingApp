import { gql } from "@apollo/client";

const CreateOrderFulfill = gql`
  mutation CreateOrderFulfill(
    $userId: Int!
    $stockId: Int!
    $quantity: Int!
    $limitPrice: Float!
    $typeAsk: Boolean!
  ) {
    createOrderFulfill(
      user_id: $userId
      stock_id: $stockId
      quantity: $quantity
      limit_price: $limitPrice
      type_ask: $typeAsk
    )
  }
`;

export default CreateOrderFulfill;
