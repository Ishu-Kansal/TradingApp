import { useState } from "react";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../../styles/PublicStyles/LoginForm.css";

function LoginForm() {
  const LOGIN_URL = "http://localhost:4500/login";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const response = await axios({
        url: LOGIN_URL,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        data: { username, password },
      });
      console.log(response);
      navigate(`/home`);
    } catch {
      (err: any) => console.log(err);
    }
  };

  const buttonStyles = {
    "&:hover": {
      backgroundColor: "#3e464d",
    },
    "&:active": {
      backgroundColor: "black",
    },
    backgroundColor: "#109DFF",
    width: "300px",
    borderTopLeftRadius: "15px",
    borderTopRightRadius: "15px",
    borderBottomLeftRadius: "15px",
    borderBottomRightRadius: "15px",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: "17px",
    fontFamily: "Arial, Helvetica, sans-serif",
    letterSpacing: "1.5px",
  };

  return (
    <div className="loginForm">
      <h1 id="login-header">Login!</h1>
      <TextField
        className="input-field"
        id="username-field"
        label="username"
        onChange={(e) => setUsername(e.target.value)}
      >
        {" "}
        Username:{" "}
      </TextField>
      <TextField
        className="input-field"
        id="password-field"
        label="password"
        type="password"
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
      >
        {" "}
        Password:{" "}
      </TextField>
      <Button
        id="submit-button"
        sx={buttonStyles}
        onClick={() => handleSubmit()}
      >
        submit
      </Button>
    </div>
  );
}

export default LoginForm;
