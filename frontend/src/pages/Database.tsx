import { useQuery } from "@apollo/client";
//import GetAllOrders from '../graphql/queries';

import GetAllOrders from "../graphql/GetAllOrders.ts";
import BidAskOrdersTable from "../components/BidAskOrdersTable";
import Button from "@mui/material/Button";
import OrderForm from "../components/OrderForm.tsx";
import axios from "axios";
import { useEffect, useState } from "react";

function Database() {
  const DB_URL = "http://localhost:4500/allorders";
  const [data, setData] = useState([]);
  // const { data } = useQuery(GetAllOrders, {
  //   //pollInterval: 5000,
  // });
  // // if (data) {
  // //   console.log(data);
  // // }
  useEffect(() => {
    getData();
  }, []);
  function getData() {
    axios({
      url: DB_URL,
      method: "GET",
    })
      .then((response) => {
        setData(response.data.data);
        console.log(response);
      })
      .catch((err) => console.log(err));
  }
  return (
    <div className="Bid-Ask-Page">
      <div className="Buttons and Headers">
        <Button href="/home">Home</Button>
        <OrderForm></OrderForm>
      </div>
      <div>
        {data && <BidAskOrdersTable rows={data} />}

        {/* {data &&
        data.allOrders.map((order) => {
          return <h1>{JSON.stringify(order)}</h1>;
        })} */}
      </div>
    </div>
  );
}

export default Database;
