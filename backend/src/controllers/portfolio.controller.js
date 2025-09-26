// src/controllers/portfolio.controller.js

const connection = require("../db.js");

// Mengambil semua item portfolio
exports.findAll = (req, res) => {
  connection.query("SELECT * FROM portfolio", (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Terjadi kesalahan saat mengambil data portfolio." });
    } else {
      res.send(data);
    }
  });
};

// Menambah item portfolio baru
exports.create = (req, res) => {
  const { title, description, imageUrl, category } = req.body;
  
  const newPortfolio = { 
    title, 
    description, 
    image_url: imageUrl, 
    kategori: category // Menggunakan 'kategori' untuk mencocokkan skema DB
  };

  connection.query("INSERT INTO portfolio SET ?", newPortfolio, (err, data) => {
    if (err) {
      console.error("Error creating portfolio item:", err);
      res.status(500).send({ message: "Terjadi kesalahan saat menambah item portfolio.", error: err.sqlMessage });
    } else {
      res.status(201).send({ id: data.insertId, ...newPortfolio });
    }
  });
};

// Mengedit item portfolio
exports.update = (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl, category } = req.body;

  const updatedPortfolio = { 
    title, 
    description, 
    image_url: imageUrl,
    kategori: category // Menggunakan 'kategori' untuk mencocokkan skema DB
  };

  connection.query("UPDATE portfolio SET ? WHERE id = ?", [updatedPortfolio, id], (err, data) => {
    if (err) {
      console.error("Error updating portfolio item:", err);
      res.status(500).send({ message: "Terjadi kesalahan saat mengedit item portfolio.", error: err.sqlMessage });
    } else if (data.affectedRows === 0) {
      res.status(404).send({ message: `Tidak dapat menemukan item portfolio dengan id ${id}.` });
    } else {
      res.send({ message: "Item portfolio berhasil diperbarui." });
    }
  });
};

// Menghapus item portfolio
exports.delete = (req, res) => {
  const { id } = req.params;

  connection.query("DELETE FROM portfolio WHERE id = ?", id, (err, data) => {
    if (err) {
      console.error("Error deleting portfolio item:", err);
      res.status(500).send({ message: "Terjadi kesalahan saat menghapus item portfolio.", error: err.sqlMessage });
    } else if (data.affectedRows === 0) {
      res.status(404).send({ message: `Tidak dapat menemukan item portfolio dengan id ${id}.` });
    } else {
      res.send({ message: "Item portfolio berhasil dihapus." });
    }
  });
};