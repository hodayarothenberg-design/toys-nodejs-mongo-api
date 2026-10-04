const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");

exports.auth = (req, res, next) => {
  const token = req.header("x-api-key");

  if (!token) {
    return res.status(401).json({
      err: "You must send a token in header x-api-key"
    });
  }

  try {
    const decodeToken = jwt.verify(token, config.tokenSecret);
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(401).json({
      err: "Token invalid or expired"
    });
  }
};

exports.authAdmin = (req, res, next) => {
  const token = req.header("x-api-key");

  if (!token) {
    return res.status(401).json({
      err: "You must send a token in header x-api-key"
    });
  }

  try {
    const decodeToken = jwt.verify(token, config.tokenSecret);
    if (decodeToken.role !== "ADMIN") {
      return res.status(403).json({
        err: "You must be an admin"
      });
    }
    req.tokenData = decodeToken;
    next();
  } catch (err) {
    return res.status(401).json({
      err: "Token invalid or expired"
    });
  }
};
