// src/controllers/portfolio.controller.js
const connection = require("../db.js"); 

exports.findAll = (req, res) => {
  connection.query("SELECT * FROM portfolio", (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Terjadi kesalahan saat mengambil data galeri." });
    } else {
      res.send(data);
    }
  });
};