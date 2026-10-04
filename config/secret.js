require("dotenv").config();

exports.config = {
  tokenSecret: process.env.TOKEN_SECRET,
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT || 3001
};
