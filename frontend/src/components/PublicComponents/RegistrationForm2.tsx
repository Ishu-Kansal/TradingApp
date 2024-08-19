import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import "../../styles/PublicStyles/RegisterForm.css";
import { Alert, Button, TextField } from "@mui/material";

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
//const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const PWD_REGEX = /^[a-zA-Z0-9]{0,15}$/;
const REGISTER_URL = "http://localhost:4500/users";

function RegistrationForm2() {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if button enabled with JS hack
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    if (!v1 || !v2) {
      setErrMsg("Invalid Entry");
      return;
    }
    if (!validMatch) {
      setErrMsg("Passwords Do Not Match");
      return;
    }
    try {
      const response = await axios.post(
        REGISTER_URL,
        { username: user, password: pwd },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: false,
        }
      );
      // TODO: remove console.logs before deployment
      console.log(JSON.stringify(response?.data));
      //console.log(JSON.stringify(response))
      setSuccess(true);
      //clear state and controlled inputs
      setUser("");
      setPwd("");
      setMatchPwd("");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      if (!err?.response) {
        console.log(err);
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg("Username Taken");
      } else {
        setErrMsg("Registration Failed");
      }
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
    <>
      {success ? (
        <section className="successbox">
          <h1>Success!</h1>
          <p>
            <a href="/login">Sign In</a>
          </p>
        </section>
      ) : (
        <section className="formbox">
          <h1>Register!</h1>
          <TextField
            className="input-field"
            id="username-field"
            label="username"
            onChange={(e) => setUser(e.target.value)}
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
            onChange={(e) => setPwd(e.target.value)}
          >
            {" "}
            Password:{" "}
          </TextField>
          <TextField
            className="input-field"
            id="password-validation-field"
            label="confirm password"
            type="password"
            onChange={(e) => setMatchPwd(e.target.value)}
          >
            {" "}
            Confirm Password:{" "}
          </TextField>
          {errMsg && <Alert severity="error">Error: {errMsg}</Alert>}
          <Button
            className="submitButton"
            onClick={handleSubmit}
            style={buttonStyles}
            disabled={!validName || !validPwd || !validMatch ? true : false}
          >
            submit
          </Button>
          <p>
            Already registered?{" "}
            <span className="line">
              <Link to="/login">Sign In</Link>
            </span>
          </p>
        </section>
      )}
    </>
  );
}

export default RegistrationForm2;
