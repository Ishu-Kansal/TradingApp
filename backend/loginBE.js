import express from "express";
import cookieParser from "cookie-parser";
import pkg from "body-parser";
import cors from "cors";
const { json, urlencoded } = pkg;
import {
  allOrders,
  getBids,
  getOrder,
} from "./src/queries_REST/bidAsk_queries.js";
import {
  getUsers,
  createUser,
  getUser,
  validateUser,
} from "./src/queries_REST/user_queries.js";

const app = express();

const port = 4500;

let corsOptions = {
  credentials: "true",
  origin: ["http://localhost:4500", "http://localhost:5173"],
  allowedHeaders: "*",
};
app.use(json());
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.use(cors(corsOptions));

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/bids", getBids);
app.get("/orders/:id", getOrder);
app.get("/allorders", allOrders);

/*Users routes */
app.get("/users", getUsers);
app.get("/users/:id", getUser);
app.post("/users", createUser);
app.post("/login", validateUser);

app.listen(port, () => {
  console.log(`APP RUNNING ON PORT ${port}`);
});
