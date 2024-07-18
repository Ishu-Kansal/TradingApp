import express from "express";
import pkg from "body-parser";
const { json, urlencoded } = pkg;
import { createOrderFulfill } from "./src/queries_REST.js/bidAsk_queries.js";

const app = express();

const port = 9000;

app.use(json());
app.use(
  urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.post("/create", createOrderFulfill);

app.listen(port, () => {
  console.log(`APP RUNNING ON PORT ${port}`);
});
