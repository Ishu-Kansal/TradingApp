import axios from "axios";
import { validateDB } from "../../OrderCreationValidator.js";

const PARALLEL_URL = "http://localhost:9000/createq";

function genRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genRandomDecimal(min) {
  const precision = 100;
  return min + Math.round(Math.random() * precision) / precision;
}

function getRandomDecimal(min, max) {
  // Generate a random number between min (inclusive) and max (exclusive)
  let random = Math.random() * (max - min) + min;
  // Round the result to 2 decimal places
  return Math.round(random * 100) / 100;
}

const delay = (delayInms) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

let haltLoop = 0;

for (let i = 0; i < 100; i++) {
  if (haltLoop != 0) {
    break;
  }
  //   let resolver = await delay(20);
  const data = await axios({
    url: PARALLEL_URL,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: {
      user_id: i,
      stock_id: genRandomInt(1, 1),
      quantity: genRandomInt(1, 10),
      limit_price: getRandomDecimal(2, 4),
      type_ask: i % 2 == 0,
    },
  });
  console.log(data.data);
  // .then((res) => {
  //   console.log(res.data);
  // })
  // .catch((err) => {
  //   console.log(err);
  //   haltLoop = 1;
  // });

  const isValid = await validateDB();
  if (!isValid) {
    console.log("invalid data:");
    break;
  }
}
