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

exports.create = (req, res) => {
    // Ambil juga 'waktu_durasi' dari req.body
    const { nama_paket, harga, deskripsi_paket, studio_name, image_url, is_active, waktu_durasi } = req.body;
    
    const parsedHarga = parseInt(harga, 10);

    let finalDurasi = null; // Default NULL
    if (waktu_durasi !== null && waktu_durasi !== undefined && waktu_durasi !== '') {
        const parsedDurasi = parseInt(waktu_durasi, 10);
        // Validasi durasi (1-30 menit)
        if (!isNaN(parsedDurasi) && parsedDurasi > 0 && parsedDurasi <= 30) {
            finalDurasi = parsedDurasi;
        } else {
            // Jika durasi diisi tapi tidak valid, kirim error
            return res.status(400).send({
                message: "Durasi tidak valid. Masukkan angka antara 1 dan 30 menit, atau kosongkan."
            });
        }
    }

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
        image_url, // ✅ Gunakan URL lengkap dari body (sesuai frontend Anda)
        is_active: is_active === 'true' || is_active === true ? 1 : 0,
        waktu_durasi: finalDurasi // ✅ Tambahkan 'waktu_durasi' di sini
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

exports.update = (req, res) => {
    const packageId = req.params.id;
    const { nama_paket, harga, deskripsi_paket, studio_name, image_url, is_active, waktu_durasi } = req.body;

    const parsedHarga = parseInt(harga, 10);

    let finalDurasi = null;
    if (waktu_durasi !== null && waktu_durasi !== undefined && waktu_durasi !== '') {
        const parsedDurasi = parseInt(waktu_durasi, 10);
        if (!isNaN(parsedDurasi) && parsedDurasi > 0 && parsedDurasi <= 30) {
            finalDurasi = parsedDurasi;
        } else {
            return res.status(400).send({
                message: "Durasi tidak valid. Masukkan angka antara 1 dan 30 menit, atau kosongkan jika tidak ada durasi."
            });
        }
    }

    if (!nama_paket || isNaN(parsedHarga) || parsedHarga < 0 || !deskripsi_paket || !studio_name || !image_url) {
        return res.status(400).send({ message: "Data paket tidak lengkap atau tidak valid." });
    }

    const updatedData = {
        nama_paket,
        harga: parsedHarga,
        deskripsi_paket,
        studio_name,
        image_url,
        is_active: is_active === 'true' || is_active === true ? 1 : 0,
        waktu_durasi: finalDurasi
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

// Menghapus paket (Tidak diubah)
exports.delete = (req, res) => {
    const packageId = req.params.id;

    connection.query("SELECT image_url FROM packages WHERE id = ?", packageId, (err, result) => {
        if (err) {
            return res.status(500).send({ message: "Gagal menemukan paket untuk dihapus." });
        }
        if (result.length > 0) {
            const oldImage = result[0].image_url;
            if (oldImage) {
                // Perbaikan path jika image_url adalah path lengkap, bukan hanya nama file
                const imagePath = path.join(__dirname, '..', '..', 'public', oldImage); 
                
                // Cek jika path mengandung '/api/assets/' (URL frontend)
                if (oldImage.startsWith('/api/assets/images/')) {
                    // Adjust path to remove the frontend URL part
                    const relativePath = oldImage.replace('/api/assets/images/', '');
                    // Asumsi public folder di root backend atau /public
                    const correctedPath = path.join(__dirname, '..', '..', 'public', 'assets', 'images', relativePath);
                    
                    if (fs.existsSync(correctedPath)) {
                         fs.unlink(correctedPath, (unlinkErr) => {
                             if (unlinkErr) console.error("Gagal menghapus file lama:", unlinkErr);
                         });
                    }
                } else if (fs.existsSync(imagePath)) {
                    // Logika lama (jika oldImage adalah path relatif biasa)
                    fs.unlink(imagePath, (unlinkErr) => {
                         if (unlinkErr) console.error("Gagal menghapus file lama:", unlinkErr);
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


// ⭐️ PERBAIKAN: Fungsi toggleStatus
// Karena error 500 terjadi, kita pastikan logicnya sederhana
exports.toggleStatus = (req, res) => {
    const packageId = req.params.id;
    const { is_active } = req.body; // Ini adalah boolean (true/false) dari JSON

    if (typeof is_active !== 'boolean') {
        return res.status(400).send({ message: "Status 'is_active' (boolean) wajib diisi." });
    }

    // Menggunakan 1 atau 0 untuk TINYINT(1)
    const newStatusAsInt = is_active ? 1 : 0;

    connection.query(
        "UPDATE packages SET is_active = ? WHERE id = ?",
        [newStatusAsInt, packageId], 
        (err, result) => {
            if (err) {
                // Log error server
                console.error("Error updating package status:", err);
                res.status(500).send({ message: "Gagal memperbarui status paket." });
            } else if (result.affectedRows === 0) {
                res.status(404).send({ message: `Paket dengan ID ${packageId} tidak ditemukan.` });
            } else {
                res.send({ message: "Status paket berhasil diperbarui." });
            }
        }
    );
};