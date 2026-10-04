const express = require("express");
const path = require("path");
const cors = require("cors");
const { config } = require("./config/secret");
require("./db/mongoConnect");

const usersR = require("./routes/users");
const toysR = require("./routes/toys");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/users", usersR);
app.use("/toys", toysR);

app.use((req, res) => {
  res.status(404).json({ err: "Route not found" });
});

const port = config.port;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
