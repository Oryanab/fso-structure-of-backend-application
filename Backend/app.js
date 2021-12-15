const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const { Blog, User } = require("./mongo");
const usersRouter = require("./users");
const loginRouter = require("./login");
const jwt = require("jsonwebtoken");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.get("/api/blogs", async (request, response) => {
  const blogs = await Blog.find({});
  response.status(200).json(blogs);
});

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

app.post("/api/blogs", checkRequest, async (request, response) => {
  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes | 0,
  });
  const savedBlog = await blog.save();

  if (request.headers.authorization) {
    const token = getTokenFrom(request.headers.authorization);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (token && decodedToken.id) {
      const user = await User.findById(decodedToken.id);
      user.blogs = user.blogs.concat(savedBlog._id);
      await user.save();
    }
  }

  //   const userId = request.headers["_id"];
  //   if (userId) {
  //     const user = await User.findById(userId);
  //     user.blogs = user.blogs.concat(savedBlog._id);
  //     await user.save();
  //   }

  response.status(200).json(blog);
});

function checkRequest(request, response, next) {
  if (request.body.title && request.body.author && request.body.url) {
    next();
  } else {
    response.status(400).send("bad");
  }
}

app.get("/api/blogs/:id", async (request, response, next) => {
  const blog = await Blog.findById(request.params.id);
  if (blog) {
    response.json(blog);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/blogs/:id", async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = {
  app,
};
