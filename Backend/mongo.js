const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
require("dotenv").config();

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
});

const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  name: String,
  passwordHash: String,
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
});

userSchema.plugin(uniqueValidator);
const Blog = mongoose.model("Blog", blogSchema);
const User = mongoose.model("User", userSchema);

mongoose
  .connect(MONGODB_URI)
  .then((res) => console.log("Connected to DB"))
  .catch((err) => console.error("Cannot Connect to DB"));

module.exports = {
  Blog,
  User,
};
