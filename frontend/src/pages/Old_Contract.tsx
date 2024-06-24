import { useLocation } from "react-router-dom";

function Old_Contract() {
  const location = useLocation();
  console.log(location);
  return <div>{JSON.stringify(location.state.content)}</div>;
}

export default Old_Contract;
