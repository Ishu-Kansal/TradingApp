import jwt from "jsonwebtoken";

export function createTokens(user) {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username },
    "simplejwtsecret"
  );

  return accessToken;
}

export function validateTokens(req, res, next) {
  const accessToken = req.cookies["basic-access-token"];

  if (!accessToken) {
    res
      .status(400)
      .json({ status: "error", message: "User not authenticated" });
  }

  try {
    const isValidToken = jwt.verify(accessToken, "simplejwtsecret");
    if (isValidToken) {
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({
      status: "validation error",
      data: err,
    });
  }
}
