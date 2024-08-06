import express from "express";
import pkg from "body-parser";
const { json, urlencoded } = pkg;
import {
  createOrderFulfill,
  createOrderFulfillParallel,
  getAllAsksActive,
  getAllAsksActiveByStockID,
  getAllBidsActive,
  getAllBidsActiveByStockID,
} from "./src/queries_REST/bidAsk_queries.js";
import { createOrderFulfillQueue } from "./src/queries_REST/ParallelOrder.js";
import { Startup } from "./src/Queuing/Startup.js";

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
app.post("/createp", createOrderFulfillParallel);
app.post("/createq", createOrderFulfillQueue);
app.get("/activeasks", getAllAsksActiveByStockID);
app.get("/activebids", getAllBidsActiveByStockID);
app.listen(port, async () => {
  await Startup();
  console.log(`APP RUNNING ON PORT ${port}`);
});
