import React, { useState } from "react";
import axios from "axios";
import { Button, Input, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

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
      (err) => console.log(err);
    }
  };

  return (
    <div>
      <TextField onChange={(e) => setUsername(e.target.value)}>
        {" "}
        Username:{" "}
      </TextField>
      <TextField
        id="password-field"
        label="password"
        type="password"
        autoComplete="current-password"
        onChange={(e) => setPassword(e.target.value)}
      >
        {" "}
        Password:{" "}
      </TextField>
      <Button onClick={() => handleSubmit()}>submit</Button>
    </div>
  );
}

export default LoginForm;
