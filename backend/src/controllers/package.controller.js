// src/controllers/package.controller.js
const connection = require("../db.js");
const fs = require('fs');
const path = require('path');

// Mengambil semua paket, bisa difilter berdasarkan studio_name
exports.findAll = (req, res) => {
    const { studio_name } = req.query; // Tangkap parameter studio_name dari query

    let query = "SELECT * FROM packages";
    let params = [];

    // Jika parameter studio_name ada, tambahkan klausa WHERE
    if (studio_name) {
        query += " WHERE studio_name = ?";
        params.push(studio_name);
    }
    
    // Urutkan berdasarkan nama paket agar tampilan lebih rapi
    query += " ORDER BY nama_paket ASC";

    connection.query(query, params, (err, data) => {
        if (err) {
            console.error("Error fetching packages:", err);
            res.status(500).send({ message: err.message || "Terjadi kesalahan saat mengambil data paket." });
        } else {
            res.send(data);
        }
    });
};

// Menambahkan paket baru
exports.create = (req, res) => {
    if (!req.body.nama_paket || !req.body.harga || !req.body.deskripsi_paket || !req.body.studio_name) {
        res.status(400).send({ message: "Konten tidak boleh kosong!" });
        return;
    }
    
    if (!req.file) {
        res.status(400).send({ message: "Gambar paket harus diunggah." });
        return;
    }

    const newPackage = {
        nama_paket: req.body.nama_paket,
        harga: req.body.harga,
        deskripsi_paket: req.body.deskripsi_paket,
        studio_name: req.body.studio_name,
        image_url: req.file.filename,
    };

    connection.query("INSERT INTO packages SET ?", newPackage, (err, data) => {
        if (err) {
            res.status(500).send({ message: err.message || "Terjadi kesalahan saat menambahkan paket." });
        } else {
            res.send({ id: data.insertId, ...newPackage });
        }
    });
};

// Memperbarui paket
exports.update = (req, res) => {
    const packageId = req.params.id;
    const updatedData = {
        nama_paket: req.body.nama_paket,
        harga: req.body.harga,
        deskripsi_paket: req.body.deskripsi_paket,
        studio_name: req.body.studio_name,
    };

    if (req.file) {
        connection.query("SELECT image_url FROM packages WHERE id = ?", packageId, (err, result) => {
            if (err) {
                return res.status(500).send({ message: "Gagal menemukan paket lama." });
            }
            const oldImage = result[0]?.image_url;
            if (oldImage) {
                const imagePath = path.join(__dirname, '..', '..', 'public', 'assets', 'images', oldImage);
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, (unlinkErr) => {
                        if (unlinkErr) console.error("Gagal menghapus file lama:", unlinkErr);
                    });
                }
            }
            updatedData.image_url = req.file.filename;
            updatePackageInDb(packageId, updatedData, res);
        });
    } else {
        updatePackageInDb(packageId, updatedData, res);
    }
};

function updatePackageInDb(id, data, res) {
    connection.query("UPDATE packages SET ? WHERE id = ?", [data, id], (err, result) => {
        if (err) {
            res.status(500).send({ message: err.message || "Terjadi kesalahan saat memperbarui paket." });
        } else if (result.affectedRows === 0) {
            res.status(404).send({ message: `Tidak dapat menemukan paket dengan ID ${id}.` });
        } else {
            res.send({ message: "Paket berhasil diperbarui." });
        }
    });
}

// Menghapus paket
exports.delete = (req, res) => {
    const packageId = req.params.id;

    connection.query("SELECT image_url FROM packages WHERE id = ?", packageId, (err, result) => {
        if (err) {
            return res.status(500).send({ message: "Gagal menemukan paket untuk dihapus." });
        }
        if (result.length > 0) {
            const imageToDelete = result[0].image_url;
            if (imageToDelete) {
                const imagePath = path.join(__dirname, '..', '..', 'public', 'assets', 'images', imageToDelete);
                if (fs.existsSync(imagePath)) {
                    fs.unlink(imagePath, (unlinkErr) => {
                        if (unlinkErr) console.error("Gagal menghapus file:", unlinkErr);
                    });
                }
            }
        }

        connection.query("DELETE FROM packages WHERE id = ?", packageId, (err, result) => {
            if (err) {
                res.status(500).send({ message: "Gagal menghapus paket." });
            } else if (result.affectedRows === 0) {
                res.status(404).send({ message: `Tidak dapat menemukan paket dengan ID ${packageId}.` });
            } else {
                res.send({ message: "Paket berhasil dihapus." });
            }
        });
    });
};