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
    const { nama_paket, harga, deskripsi_paket, studio_name, image_url } = req.body;
    
    const parsedHarga = parseInt(harga, 10);

    // Validasi data yang diterima
    if (!nama_paket || isNaN(parsedHarga) || !deskripsi_paket || !studio_name || !image_url) {
        return res.status(400).send({ 
            message: "Data paket tidak lengkap atau tidak valid." 
        });
    }

    const newPackage = {
        nama_paket,
        harga: parsedHarga, // Gunakan harga yang sudah dikonversi
        deskripsi_paket,
        studio_name,
        image_url // ✅ Gunakan URL lengkap dari body
    };

    connection.query("INSERT INTO packages SET ?", newPackage, (err, data) => {
        if (err) {
            console.error("Error creating package:", err.sqlMessage || err);
            res.status(500).send({ message: err.message || "Terjadi kesalahan saat menambahkan paket." });
        } else {
            res.send({ id: data.insertId, ...newPackage });
        }
    });
};

// Memperbarui paket
exports.update = (req, res) => {
    const packageId = req.params.id;
    const { nama_paket, harga, deskripsi_paket, studio_name, image_url } = req.body;
    
    const parsedHarga = parseInt(harga, 10);

    if (!nama_paket || isNaN(parsedHarga) || !deskripsi_paket || !studio_name || !image_url) {
        return res.status(400).send({ message: "Data paket tidak lengkap atau tidak valid." });
    }

    const updatedData = {
        nama_paket,
        harga: parsedHarga, // Gunakan harga yang sudah dikonversi
        deskripsi_paket,
        studio_name,
        image_url // ✅ Gunakan URL lengkap dari body
    };
    
    connection.query("UPDATE packages SET ? WHERE id = ?", [updatedData, packageId], (err, result) => {
        if (err) {
            console.error("Error updating package:", err);
            res.status(500).send({ message: err.message || "Terjadi kesalahan saat memperbarui paket." });
        } else if (result.affectedRows === 0) {
            res.status(404).send({ message: `Tidak dapat menemukan paket dengan ID ${packageId}.` });
        } else {
            res.send({ message: "Paket berhasil diperbarui." });
        }
    });
};

// Menghapus paket
exports.delete = (req, res) => {
    const packageId = req.params.id;

    connection.query("SELECT image_url FROM packages WHERE id = ?", packageId, (err, result) => {
        if (err) {
            return res.status(500).send({ message: "Gagal menemukan paket untuk dihapus." });
        }
        if (result.length > 0) {
            const oldImage = result[0].image_url;
            const imagePath = path.join(__dirname, '..', '..', 'public', oldImage);
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, (unlinkErr) => {
                    if (unlinkErr) console.error("Gagal menghapus file lama:", unlinkErr);
                });
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