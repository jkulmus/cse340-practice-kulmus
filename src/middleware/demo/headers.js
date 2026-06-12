const addDemoHeaders = (req, res, next) => {
  res.setHeader("X-Demo-Page", "true");

  res.setHeader("X-Middleware-Demo", "Middleware works");

  next();
};

export { addDemoHeaders };
