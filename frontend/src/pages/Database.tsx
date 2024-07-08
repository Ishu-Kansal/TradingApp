import { useQuery } from "@apollo/client";
//import GetAllOrders from '../graphql/queries';

import GetAllOrders from "../graphql/GetAllOrders.ts";
import BidAskOrdersTable from "../components/BidAskOrdersTable";
import Button from "@mui/material/Button";
import OrderForm from "../components/OrderForm.tsx";

function Database() {
  const { data } = useQuery(GetAllOrders, {
    //pollInterval: 5000,
  });
  // if (data) {
  //   console.log(data);
  // }

  return (
    <div className="Bid-Ask-Page">
      <div className="Buttons and Headers">
        <Button href="\">Home</Button>
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
