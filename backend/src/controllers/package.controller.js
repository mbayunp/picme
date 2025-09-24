// src/controllers/package.controller.js
const connection = require("../db.js");
const fs = require('fs'); // Modul bawaan Node.js untuk berinteraksi dengan file system
const path = require('path'); // Modul bawaan Node.js untuk menangani path

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
    if (!req.body.nama_paket || !req.body.harga || !req.body.deskripsi_paket || !req.body.studio_name) {
        res.status(400).send({ message: "Konten tidak boleh kosong!" });
        return;
    }
    
    // Pastikan ada file yang diunggah saat membuat baru
    if (!req.file) {
        res.status(400).send({ message: "Gambar paket harus diunggah." });
        return;
    }

    const newPackage = {
        nama_paket: req.body.nama_paket,
        harga: req.body.harga,
        deskripsi_paket: req.body.deskripsi_paket,
        studio_name: req.body.studio_name, // Tambahkan studio_name di sini
        image_url: req.file.filename, // Nama file dari Multer
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
        studio_name: req.body.studio_name, // Tambahkan studio_name di sini
    };

    // Jika ada file baru diunggah, hapus gambar lama dan perbarui URL
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
        // Jika tidak ada file baru, langsung update data tanpa mengubah image_url
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

    // Temukan URL gambar lama
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

        // Hapus entri dari database
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