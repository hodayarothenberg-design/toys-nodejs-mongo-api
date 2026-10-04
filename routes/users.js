const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel, validUser, validLogin, createToken } = require("../models/userModel");
const { auth } = require("../middlewares/auth");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ msg: "Users endpoint is working" });
});

router.get("/userInfo", auth, async (req, res) => {
  try {
    const user = await UserModel.findOne(
      { _id: req.tokenData._id },
      { password: 0 }
    );
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

router.post("/", async (req, res) => {
  const validBody = validUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    const user = new UserModel(req.body);
    user.password = await bcrypt.hash(user.password, 10);
    user.role = "USER";
    await user.save();

    user.password = "*****";
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        err: "Email already exists in system, try a different email"
      });
    }
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

router.post("/login", async (req, res) => {
  const validBody = validLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ err: "Email or password is wrong" });
    }

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) {
      return res.status(401).json({ err: "Email or password is wrong" });
    }

    const token = createToken(String(user._id), user.role);
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

module.exports = router;
