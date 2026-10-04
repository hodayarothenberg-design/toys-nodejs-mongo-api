const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { config } = require("../config/secret");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      unique: true
    },
    password: String,
    role: {
      type: String,
      default: "USER"
    }
  },
  { timestamps: true }
);

exports.UserModel = mongoose.model("users", userSchema);

exports.createToken = (_id, role) => {
  return jwt.sign({ _id, role }, config.tokenSecret, { expiresIn: "60min" });
};

exports.validUser = (_bodyData) => {
  const joiSchema = Joi.object({
    name: Joi.string().min(2).max(99).required(),
    email: Joi.string().min(5).max(99).email().required(),
    password: Joi.string().min(6).max(99).required()
  });
  return joiSchema.validate(_bodyData);
};

exports.validLogin = (_bodyData) => {
  const joiSchema = Joi.object({
    email: Joi.string().min(5).max(99).email().required(),
    password: Joi.string().min(6).max(99).required()
  });
  return joiSchema.validate(_bodyData);
};
