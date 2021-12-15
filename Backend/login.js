const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("./mongo");
require("dotenv").config();
const express = require("express");
const loginRouter = express.Router();

loginRouter.post("/", async (request, response) => {
  const body = request.body;

  const user = await User.findOne({ username: body.username });
  const passwordCorrect =
    user === null
      ? false
      : await bcrypt.compare(body.password, user.passwordHash);

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: "10m",
  });

  response
    .status(200)
    .json({ token, username: user.username, name: user.name });
});

module.exports = loginRouter;
