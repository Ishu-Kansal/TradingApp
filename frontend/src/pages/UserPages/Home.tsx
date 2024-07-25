import { Button } from "@mui/material";
import "../../styles/UserStyles/Home.css";

function Home() {
  return (
    <div className="buttons">
      <Button variant="contained" href="/options-tables">
        Options Tables
      </Button>

      <Button variant="contained" href="/bid-ask-test">
        Bid-Ask DB
      </Button>
    </div>
  );
}

export default Home;
