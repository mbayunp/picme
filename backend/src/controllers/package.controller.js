const connection = require("../db.js");
const fs = require('fs');
const path = require('path');

// Mengambil semua paket
exports.findAll = (req, res) => {
  connection.query("SELECT * FROM packages", (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Terjadi kesalahan saat mengambil data paket." });
    } else {
      res.send(data);
    }
  });
};

// Menambahkan paket baru
exports.create = (req, res) => {
  if (!req.body.nama_paket || !req.body.harga || !req.body.deskripsi_paket) {
    res.status(400).send({ message: "Konten tidak boleh kosong!" });
    return;
  }

  const newPackage = {
    nama_paket: req.body.nama_paket,
    harga: req.body.harga,
    deskripsi_paket: req.body.deskripsi_paket,
    image_url: req.file ? req.file.filename : null,
  };

  connection.query("INSERT INTO packages SET ?", newPackage, (err, data) => {
    if (err) {
      res.status(500).send({ message: err.message || "Terjadi kesalahan saat menambahkan paket." });
    } else {
      res.status(201).send({ id: data.insertId, ...newPackage });
    }
  });
};

// Memperbarui paket
exports.update = (req, res) => {
  const packageId = req.params.id;
  const { nama_paket, harga, deskripsi_paket } = req.body;
  const image = req.file;

  connection.query("SELECT image_url FROM packages WHERE id = ?", [packageId], (err, rows) => {
    if (err) {
      console.error("Error fetch old image:", err);
      return res.status(500).send({ message: "Error server." });
    }
    const oldImage = rows[0]?.image_url;

    let newImageUrl = oldImage;
    if (image) {
      newImageUrl = image.filename;
      if (oldImage) {
        const oldPath = path.join(__dirname, '..', 'public', 'images', oldImage);
        fs.unlink(oldPath, err => {
          if (err) console.error("Error menghapus file lama:", err);
        });
      }
    }

    connection.query(
      "UPDATE packages SET nama_paket = ?, harga = ?, deskripsi_paket = ?, image_url = ? WHERE id = ?",
      [nama_paket, harga, deskripsi_paket, newImageUrl, packageId],
      (err2, result) => {
        if (err2) {
          console.error("Error update package:", err2);
          return res.status(500).send({ message: "Error memperbarui paket." });
        }
        if (result.affectedRows === 0) {
          return res.status(404).send({ message: "Paket tidak ditemukan." });
        }
        res.send({
          message: "Paket berhasil diperbarui.",
          image_url: newImageUrl ? `${req.protocol}://${req.get('host')}/assets/images/${newImageUrl}` : null,
        });
      }
    );
  });
};

// Menghapus paket
exports.delete = (req, res) => {
  const packageId = req.params.id;
  
  // Temukan URL gambar lama
  connection.query("SELECT image_url FROM packages WHERE id = ?", [packageId], (err, rows) => {
    if (err) {
      console.error("Error fetching image to delete:", err);
      return res.status(500).send({ message: "Error server." });
    }
    const imageUrl = rows[0]?.image_url;
    connection.query("DELETE FROM packages WHERE id = ?", [packageId], (err2, result) => {
      if (err2) {
        console.error("Error deleting package:", err2);
        return res.status(500).send({ message: "Error menghapus paket." });
      }
      if (imageUrl) {
        const filePath = path.join(__dirname, '..', 'public', 'images', imageUrl);
        fs.unlink(filePath, errDel => {
          if (errDel) console.error("Error menghapus file gambar:", errDel);
        });
      }
      res.send({ message: "Paket berhasil dihapus." });
    });
  });
};
