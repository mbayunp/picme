// src/controllers/product.controller.js
const connection = require("../db.js"); 

exports.findAll = (req, res) => {
  connection.query("SELECT * FROM products", (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Terjadi kesalahan saat mengambil data produk." });
    } else {
      res.send(data);
    }
  });
};