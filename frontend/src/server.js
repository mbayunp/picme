// src/server.js
const express = require("express");
const cors = require("cors");
const path = require('path');
const connection = require("./db.js");

const app = express();

app.use(cors());
app.use('/assets', express.static(path.join(__dirname, '../frontend/src/assets')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Photo Studio API." });
});

// Import dan gunakan rute yang sudah diperbarui
const servicesRoutes = require("./routes/services.routes.js");
const portfolioRoutes = require("./routes/portfolio.routes.js");
const postRoutes = require("./routes/post.routes.js");
const productRoutes = require("./routes/product.routes.js");

app.use("/api/services", servicesRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
