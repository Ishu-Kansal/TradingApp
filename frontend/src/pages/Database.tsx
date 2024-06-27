import { useQuery } from "@apollo/client";
//import GetAllOrders from '../graphql/queries';

import GetAllOrders from "../graphql/GetAllOrders";
import BidAskOrdersTable from "../components/BidAskOrdersTable";

function Database() {
  const { data } = useQuery(GetAllOrders, {
    // pollInterval: 5000,
  });
  if (data) {
    console.log(data);
  }
  return (
    <div>
      <div>{data && <BidAskOrdersTable rows={data} />}</div>

      {/* {data &&
        data.allOrders.map((order) => {
          return <h1>{JSON.stringify(order)}</h1>;
        })} */}
    </div>
  );
}

export default Database;
