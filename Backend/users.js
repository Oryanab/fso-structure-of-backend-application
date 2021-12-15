const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersRouter = require("express").Router();
const { User } = require("./mongo");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs");
  response.json(users);
});

usersRouter.post("/", usernameValidator, async (request, response) => {
  const body = request.body;
  const passwordHash = await bcrypt.hash(body.password, 10);
  try {
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
      blogs: [],
    });
    const savedUser = await user.save();
    console.log(savedUser, "Saved User");
    response.status(200).json(savedUser);
  } catch (err) {
    console.log(err, "error");
    response.status(400).send(err);
  }
});

async function usernameValidator(request, response, next) {
  if (await User.findOne({ username: request.body.username })) {
    response.status(400).json({ error: "`username` to be unique" });
  } else {
    next();
  }
}

module.exports = usersRouter;
