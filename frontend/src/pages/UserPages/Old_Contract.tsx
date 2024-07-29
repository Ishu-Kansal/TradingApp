import moment from "moment";
import { useLocation } from "react-router-dom";

function calc_days_diff(expiry: string) {
  const exp_date = moment(expiry);
  const nowDate = moment().startOf("day");
  const diffDays = exp_date.diff(nowDate, "days");
  return diffDays;
}

function Old_Contract() {
  const location = useLocation();
  console.log(location);

  const dte = calc_days_diff(location.state.exp);

  const getProfitSeries = async () => {};

  return (
    <>
      <div>{JSON.stringify(location.state.content)}</div>
      <div>{location.state.exp}</div>
    </>
  );
}

export default Old_Contract;
