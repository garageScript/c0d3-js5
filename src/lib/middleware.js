const jwt = require("jsonwebtoken");
const { getUser } = require("./userlist");
const { JWT_PRIVATE_SECRET } = require('./fakeEnv')
const middlewares = {};

middlewares.setUser = (req, res, next) => {
  if (req.session.username) {
    req.user = getUser(req.session.username);
  }

  const authToken = (req.headers.authorization || '').split(' ').pop();
  if (authToken) {
    try {
      // will throw error if invalid token
      const data = jwt.verify(authToken,JWT_PRIVATE_SECRET)
      req.user = getUser(data.username)
    } catch (error) {
      // Invalid authToken, don't set user and continue
    }
  }

  next();
};

middlewares.cors = () => {
  return (req, res, next) => {
    console.log("res header");
    // Credentials - https://stackoverflow.com/questions/24687313/what-exactly-does-the-access-control-allow-credentials-header-do
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE"); // cors preflight
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Credentials"
    );
    next();
  };
};

module.exports = middlewares;
