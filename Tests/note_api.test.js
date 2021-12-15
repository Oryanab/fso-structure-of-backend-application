const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../Backend/app").app;
const {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
} = require("./test_helper");
const api = supertest(app);
const { Blog, User } = require("../Backend/mongo");
const bcrypt = require("bcrypt");

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);
});

test("notes are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
}, 100000);

test("all notes are returned", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body).toHaveLength(initialBlogs.length);
});

test("a specific note is within the returned notes", async () => {
  const response = await api.get("/api/blogs");
  const contents = response.body.map((r) => r.title);
  expect(contents).toContain("blog 2");
});

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "async/await simplifies making async calls",
    author: "author 3",
    url: "a url 3",
    likes: 3,
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");
  const contents = response.body.map((r) => r.title);
  expect(response.body).toHaveLength(initialBlogs.length + 1);
  expect(contents).toContain("async/await simplifies making async calls");
});

test("blog without title is not added", async () => {
  const newNote = {
    important: true,
  };
  await api.post("/api/blogs").send(newNote).expect(400);
  const notesAtEnd = await blogsInDb();
  expect(notesAtEnd).toHaveLength(initialBlogs.length);
});

test("a specific blog can be viewed", async () => {
  const blogAtStart = await blogsInDb();

  const blogToView = blogAtStart[0];

  const resultBlog = await api
    .get(`/api/blogs/${blogToView["_id"]}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const processedBlogToView = JSON.parse(JSON.stringify(blogToView));

  expect(resultBlog.body).toEqual(processedBlogToView);
});

test("a blog can be deleted", async () => {
  const blogAtStart = await blogsInDb();
  const blogToDelete = blogAtStart[0];

  await api.delete(`/api/blogs/${blogToDelete["_id"]}`).expect(204);

  const blogsAtEnd = await blogsInDb();
  expect(blogsAtEnd).toHaveLength(initialBlogs.length - 1);

  const titles = blogsAtEnd.map((r) => r.title);
  expect(titles).not.toContain(blogToDelete.title);
});

describe("when there is initially one user in db", () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({
      username: "root",
      name: "motti",
      passwordHash,
      blogs: ["61b78a80582ca656e9ad4df3"],
    });

    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "mluukkai",
      name: "Matti Luukkainen",
      password: "salainen",
      blogs: ["61b78a80582ca656e9ad4df4"],
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);
    expect(usernames).toContain(newUser.username);
  });
});

describe("when there is initially one user in db", () => {
  test("creation fails with proper statuscode and message if username already taken", async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: "root",
      name: "Superuser",
      password: "salainen",
      blog: [],
    };

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    expect(result.body.error).toContain("`username` to be unique");
    const usersAtEnd = await usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => {
  mongoose.connection.close();
});
