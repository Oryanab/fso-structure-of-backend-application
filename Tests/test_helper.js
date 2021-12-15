const { Blog, User } = require("../Backend/mongo");

const initialBlogs = [
  {
    title: "blog 1",
    author: "author 1",
    url: "a url",
    likes: 1,
  },
  {
    title: "blog 2",
    author: "author 2",
    url: "a url 2",
    likes: 2,
  },
];

const nonExistingId = async () => {
  const blog = new Blog({
    title: "blog 5",
    author: "author 5",
    url: "a url 5",
    likes: 5,
  });
  await blog.save();
  await blog.remove();
  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
