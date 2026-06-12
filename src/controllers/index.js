const homePage = (req, res) => {
  res.render("home", { title: "Welcome Home" });
};

const aboutPage = (req, res) => {
  res.render("about", { title: "About Me" });
};

const demoPage = (req, res) => {
  res.render("demo", { title: "Middleware Demo" });
};

const studentPage = (req, res) => {
  const student = {
    name: "Jacquelyn Kulmus",
    id: "12345",
    email: "name@example.com",
    address: "123 University Way",
  };
  res.render("student", {
    title: "Student",
    student,
  });
};

const testErrorPage = (req, res, next) => {
  const err = new Error("This is a test error");
  err.status = 500;
  next(err);
};

export { homePage, aboutPage, demoPage, studentPage, testErrorPage };
