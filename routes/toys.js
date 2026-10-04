const express = require("express");
const { ToyModel, validToy } = require("../models/toyModel");
const { auth } = require("../middlewares/auth");

const router = express.Router();
const PAGE_SIZE = 10;

const getSkip = (req) => {
  const skipQuery = Number(req.query.skip) || 0;
  return skipQuery * PAGE_SIZE;
};

const canModifyToy = (toy, tokenData) => {
  return String(toy.user_id) === String(tokenData._id) || tokenData.role === "ADMIN";
};

router.get("/", async (req, res) => {
  try {
    const skip = getSkip(req);
    const filter = {};

    if (req.query.s) {
      const searchExp = new RegExp(req.query.s, "i");
      filter.$or = [{ name: searchExp }, { info: searchExp }];
    }

    if (req.query.category) {
      filter.category = new RegExp(req.query.category, "i");
    }

    if (req.query.min || req.query.max) {
      filter.price = {};
      if (req.query.min) filter.price.$gte = Number(req.query.min);
      if (req.query.max) filter.price.$lte = Number(req.query.max);
    }

    const data = await ToyModel.find(filter)
      .limit(PAGE_SIZE)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const skip = getSkip(req);
    const searchQ = req.query.s || "";
    const searchExp = new RegExp(searchQ, "i");

    const data = await ToyModel.find({
      $or: [{ name: searchExp }, { info: searchExp }]
    })
      .limit(PAGE_SIZE)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

router.get("/category/:catname", async (req, res) => {
  try {
    const skip = getSkip(req);
    const catExp = new RegExp(req.params.catname, "i");

    const data = await ToyModel.find({ category: catExp })
      .limit(PAGE_SIZE)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

router.get("/prices", async (req, res) => {
  try {
    const skip = getSkip(req);
    const min = Number(req.query.min) || 0;
    const max = Number(req.query.max) || 999999;

    const data = await ToyModel.find({
      price: { $gte: min, $lte: max }
    })
      .limit(PAGE_SIZE)
      .skip(skip)
      .sort({ price: 1 });

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

router.get("/single/:id", async (req, res) => {
  try {
    const data = await ToyModel.findOne({ _id: req.params.id });
    if (!data) {
      return res.status(404).json({ err: "Toy not found" });
    }
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: "Invalid id or server error", details: err.message });
  }
});

router.get("/count", async (req, res) => {
  try {
    const count = await ToyModel.countDocuments({});
    res.json({ count });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

router.post("/", auth, async (req, res) => {
  const validBody = validToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    const toy = new ToyModel(req.body);
    toy.user_id = String(req.tokenData._id);
    await toy.save();
    res.status(201).json(toy);
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: "Server error", details: err.message });
  }
});

router.put("/:id", auth, async (req, res) => {
  const validBody = validToy(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }

  try {
    const toy = await ToyModel.findOne({ _id: req.params.id });
    if (!toy) {
      return res.status(404).json({ err: "Toy not found" });
    }

    if (!canModifyToy(toy, req.tokenData)) {
      return res.status(403).json({
        err: "You can edit only toys that belong to your user_id"
      });
    }

    const data = await ToyModel.updateOne({ _id: req.params.id }, req.body);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: "Invalid id or server error", details: err.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const toy = await ToyModel.findOne({ _id: req.params.id });
    if (!toy) {
      return res.status(404).json({ err: "Toy not found" });
    }

    if (!canModifyToy(toy, req.tokenData)) {
      return res.status(403).json({
        err: "You can delete only toys that belong to your user_id"
      });
    }

    const data = await ToyModel.deleteOne({ _id: req.params.id });
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(400).json({ err: "Invalid id or server error", details: err.message });
  }
});

module.exports = router;
