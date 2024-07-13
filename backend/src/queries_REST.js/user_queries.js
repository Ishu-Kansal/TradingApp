import db from "../../pgAdaptor.js";
import bcrypt, { genSalt } from "bcrypt";

export async function getUsers(req, res) {
  try {
    const users = await db.any(
      `SELECT * FROM public."Users" ORDER BY user_id ASC`
    );

    res.status(200).json({
      status: "success",
      data: users,
      message: "retrieved all users",
    });
  } catch (err) {
    console.log(err);
  }
}

export async function getUser(req, res) {
  try {
    const users = await db.any(
      `SELECT * FROM public."Users" WHERE user_id = ${req.params.id} ORDER BY user_id ASC`
    );

    res.status(200).json({
      status: "success",
      data: users,
      message: "retrieved all users",
    });
  } catch (err) {
    console.log(err);
  }
}

export async function createUser(req, res) {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  try {
    const existingUsers = await db.any(
      `SELECT * FROM public."Users" WHERE username='${req.body.username}'`
    );
    if (existingUsers.length != 0) {
      res.status(400).json({
        status: "failure",
        data: "failed to create user",
        message: `user already existing with name ${req.body.username}`,
      });
    } else {
      const createdUser = await db.any(
        `INSERT INTO public."Users" (username, password_hash) VALUES ('${req.body.username}', '${password}') RETURNING user_id`
      );
      res.status(200).json({
        status: "success",
        data: createdUser,
        message: `created user with id: ${createdUser}`,
      });
    }
  } catch (err) {
    console.log(err);
  }
}

export async function validateUser(req, res) {
  try {
    const userDetails = await db.any(
      `SELECT * FROM public."Users" WHERE username='${req.body.username}'`
    );

    if (userDetails.length != 1) {
      res.status(400).json({
        status: "failure",
        data: "failed to fetch user",
        message: "incorrect username provided",
      });
    } else {
      const user = userDetails[0];
      bcrypt.compare(
        req.body.password,
        user.password_hash,
        function (error, responseCrypt) {
          if (error) {
            res.status(422).json({
              status: "failure",
              data: error,
              message: "oops! something went wrong",
            });
          } else if (responseCrypt) {
            res.status(200).json({
              status: "success",
              data: req.body.username,
              message: "login successful!",
            });
          } else {
            res.status(400).json({
              status: "failure",
              data: req.body.username,
              message: "passwords do not match",
            });
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
}
