import express from "express";
import pkg from "body-parser";
const { json, urlencoded } = pkg;
const app = express();
import { getBids, getOrder } from "./src/queries_REST.js/bidAsk_queries.js";
import {
  getUsers,
  createUser,
  getUser,
  validateUser,
} from "./src/queries_REST.js/user_queries.js";
const port = 4500;

app.use(json());
app.use(
  urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/bids", getBids);
app.get("/orders/:id", getOrder);

/*Users routes */
app.get("/users", getUsers);
app.get("/users/:id", getUser);
app.post("/users", createUser);
app.post("/login", validateUser);

app.listen(port, () => {
  console.log(`APP RUNNING ON PORT ${port}`);
});
