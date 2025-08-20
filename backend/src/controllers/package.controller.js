// src/controllers/package.controller.js
const connection = require("../db.js");

exports.findAll = (req, res) => {
  connection.query("SELECT * FROM packages", (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Terjadi kesalahan saat mengambil data paket harga." });
    } else {
      res.send(data);
    }
  });
};
