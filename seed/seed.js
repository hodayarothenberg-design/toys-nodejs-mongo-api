require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { UserModel } = require("../models/userModel");
const { ToyModel } = require("../models/toyModel");
const { config } = require("../config/secret");

const seedUsers = [
  {
    name: "Admin User",
    email: "admin@toys.com",
    password: "123456",
    role: "ADMIN"
  },
  {
    name: "Regular User",
    email: "user@toys.com",
    password: "123456",
    role: "USER"
  }
];

const seedToys = [
  {
    name: "Wooden Puzzle Animals",
    info: "Colorful wooden puzzle with farm animals for toddlers.",
    category: "Educational",
    img_url: "https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg",
    price: 29
  },
  {
    name: "ABC Learning Blocks",
    info: "Set of 26 alphabet blocks that help children learn letters.",
    category: "Educational",
    img_url: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg",
    price: 35
  },
  {
    name: "Junior Microscope Kit",
    info: "Beginner microscope with slides for science exploration at home.",
    category: "Educational",
    img_url: "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg",
    price: 59
  },
  {
    name: "Math Counting Beads",
    info: "Wooden beads used to practice counting and simple math.",
    category: "Educational",
    img_url: "https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg",
    price: 22
  },
  {
    name: "Soccer Ball Size 4",
    info: "Durable outdoor soccer ball for kids and backyard games.",
    category: "Outdoor",
    img_url: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg",
    price: 25
  },
  {
    name: "Jump Rope Pro",
    info: "Adjustable jump rope for sport and outdoor activity.",
    category: "Outdoor",
    img_url: "https://images.pexels.com/photos/4397840/pexels-photo-4397840.jpeg",
    price: 15
  },
  {
    name: "Kite Rainbow Flyer",
    info: "Large colorful kite that flies easily on a windy day.",
    category: "Outdoor",
    img_url: "https://images.pexels.com/photos/163077/kite-festival-kite-flying-163077.jpeg",
    price: 18
  },
  {
    name: "Bubble Machine Fun",
    info: "Outdoor bubble machine that creates hundreds of bubbles.",
    category: "Outdoor",
    img_url: "https://images.pexels.com/photos/1376042/pexels-photo-1376042.jpeg",
    price: 32
  },
  {
    name: "Classic Teddy Bear",
    info: "Soft brown teddy bear that is perfect as a first toy.",
    category: "Plush",
    img_url: "https://images.pexels.com/photos/207891/pexels-photo-207891.jpeg",
    price: 27
  },
  {
    name: "Unicorn Plush Pillow",
    info: "Cute unicorn plush that can also be used as a pillow.",
    category: "Plush",
    img_url: "https://images.pexels.com/photos/3661380/pexels-photo-3661380.jpeg",
    price: 24
  },
  {
    name: "Dinosaur Plush T-Rex",
    info: "Friendly T-Rex stuffed animal for kids who love dinosaurs.",
    category: "Plush",
    img_url: "https://images.pexels.com/photos/3661387/pexels-photo-3661387.jpeg",
    price: 31
  },
  {
    name: "Mini Bunny Family",
    info: "Set of three small bunny plush toys in different colors.",
    category: "Plush",
    img_url: "https://images.pexels.com/photos/36029/adow-animal-dependence-mother.jpg",
    price: 19
  }
];

async function seed() {
  if (!config.mongoUrl) {
    console.error("MONGO_URL is missing. Create a .env file first.");
    process.exit(1);
  }

  await mongoose.connect(config.mongoUrl);
  console.log("Connected. Seeding database TOYS...");

  await UserModel.deleteMany({});
  await ToyModel.deleteMany({});

  const createdUsers = [];
  for (const u of seedUsers) {
    const hash = await bcrypt.hash(u.password, 10);
    const user = await UserModel.create({
      name: u.name,
      email: u.email,
      password: hash,
      role: u.role
    });
    createdUsers.push(user);
    console.log(`Created user: ${user.email} / role: ${user.role}`);
  }

  const ownerId = String(createdUsers[1]._id);
  for (const t of seedToys) {
    await ToyModel.create({ ...t, user_id: ownerId });
  }

  console.log(`Created ${seedToys.length} toys in 3 categories: Educational, Outdoor, Plush`);
  console.log("Demo login:");
  console.log("  admin@toys.com / 123456  (ADMIN)");
  console.log("  user@toys.com  / 123456  (USER)");

  await mongoose.disconnect();
  console.log("Seed finished.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
