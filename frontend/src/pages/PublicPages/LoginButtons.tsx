import { Button } from "@mui/material";

function LoginButtons() {
  return (
    <div className="buttons">
      <Button variant="contained" href="/register">
        Register Now!
      </Button>
      <Button variant="contained" href="/login">
        Login here!
      </Button>
    </div>
  );
}

export default LoginButtons;
