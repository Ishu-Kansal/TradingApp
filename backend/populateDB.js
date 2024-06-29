import { request } from "graphql-request";
const endpoint = "http://localhost:9090";

function genRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genRandomDecimal(min) {
  const precision = 100;
  return min + Math.round(Math.random() * precision) / precision;
}

for (let i = 0; i < 10; i++) {
  request(
    endpoint,
    `mutation CreateOrderPopulate($userId: Int!, $stockId: Int!, $quantity: Int!, $limitPrice: Float!, $status: Int!, $typeAsk: Boolean!) {
        createOrderPopulate(user_id: $userId, stock_id: $stockId, quantity: $quantity, limit_price: $limitPrice, status: $status, type_ask: $typeAsk) 
      }`,
    {
      userId: genRandomInt(1, 4),
      stockId: genRandomInt(1, 5),
      quantity: genRandomInt(1, 10),
      limitPrice: genRandomDecimal(1),
      status: 0,
      typeAsk: false,
    }
  )
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
}

for (let i = 0; i < 10; i++) {
  request(
    endpoint,
    `mutation CreateOrderPopulate($userId: Int!, $stockId: Int!, $quantity: Int!, $limitPrice: Float!, $status: Int!, $typeAsk: Boolean!) {
          createOrderPopulate(user_id: $userId, stock_id: $stockId, quantity: $quantity, limit_price: $limitPrice, status: $status, type_ask: $typeAsk) 
        }`,
    {
      userId: genRandomInt(1, 4),
      stockId: genRandomInt(1, 5),
      quantity: genRandomInt(1, 10),
      limitPrice: genRandomDecimal(2),
      status: 0,
      typeAsk: true,
    }
  )
    .then((data) => console.log(data))
    .catch((err) => console.log(err));
}

// request(
//   endpoint,
//   `mutation CreateOrderPopulate($userId: Int!, $stockId: Int!, $quantity: Int!, $limitPrice: Float!, $status: Int!, $typeAsk: Boolean!) {
//   createOrderPopulate(user_id: $userId, stock_id: $stockId, quantity: $quantity, limit_price: $limitPrice, status: $status, type_ask: $typeAsk)
// }`,
//   {
//     userId: 1,
//     stockId: 2,
//     quantity: 3,
//     limitPrice: 4,
//     status: 0,
//     typeAsk: true,
//   }
// )
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));
