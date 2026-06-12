const getCurrentGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 18) {
    return "Good Afternoon";
  }

  return "Good Evening";
};

const addLocalVariables = (req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();

  res.locals.NODE_ENV = process.env.NODE_ENV || "development";

  res.locals.queryParams = req.query;

  res.locals.greeting = getCurrentGreeting();

  const themes = ["blue-theme", "green-theme", "red-theme"];

  res.locals.bodyClass = themes[Math.floor(Math.random() * themes.length)];

  res.locals.isLoggedIn = false;

  if (req.session && req.session.user) {
    res.locals.isLoggedIn = true;
  }

  next();
};

export { addLocalVariables };
