const connection = require("../db.js");
const fs = require('fs');
const path = require('path');

// --- Helper Function ---
// Mendapatkan path folder 'public' yang aman untuk semua OS (Windows/Linux)
const getPublicPath = () => {
    return path.join(process.cwd(), 'public'); 
};

// --- 1. Ambil Semua Paket ---
exports.findAll = (req, res) => {
    const { studio_name } = req.query;
    let query = "SELECT * FROM packages";
    let params = [];

    // Filter jika ada parameter studio
    if (studio_name) {
        query += " WHERE studio_name = ?";
        params.push(studio_name);
    }
    
    query += " ORDER BY nama_paket ASC";

    connection.query(query, params, (err, data) => {
        if (err) {
            console.error("Error fetching packages:", err);
            return res.status(500).send({ message: "Terjadi kesalahan server." });
        }
        res.send(data);
    });
};

// --- 2. Buat Paket Baru ---
exports.create = (req, res) => {
    const { nama_paket, harga, deskripsi_paket, studio_name, image_url, is_active, waktu_durasi } = req.body;
    
    // Parsing Harga
    const parsedHarga = parseInt(harga, 10);

    // Validasi is_active (Pastikan jadi angka 1 atau 0)
    let activeStatus = 1; 
    if (is_active !== undefined) {
        // Cek berbagai kemungkinan input dari FormData (string 'true', '1', boolean true)
        if (String(is_active) === 'true' || String(is_active) === '1') {
            activeStatus = 1;
        } else {
            activeStatus = 0;
        }
    }

    // Validasi waktu_durasi (Boleh NULL)
    let finalDurasi = null;
    if (waktu_durasi && waktu_durasi !== 'null' && waktu_durasi !== '') {
        const d = parseInt(waktu_durasi, 10);
        if (!isNaN(d) && d > 0) finalDurasi = d;
    }

    // Validasi Data Wajib
    if (!nama_paket || isNaN(parsedHarga) || !studio_name || !image_url) {
        return res.status(400).send({ message: "Data wajib (Nama, Harga, Studio, Gambar) tidak lengkap." });
    }

    const newPackage = {
        nama_paket,
        harga: parsedHarga,
        deskripsi_paket,
        studio_name,
        image_url, 
        is_active: activeStatus,
        waktu_durasi: finalDurasi
    };

    connection.query("INSERT INTO packages SET ?", newPackage, (err, data) => {
        if (err) {
            console.error("SQL Error Create:", err);
            return res.status(500).send({ message: "Gagal menyimpan ke database." });
        }
        res.send({ id: data.insertId, ...newPackage });
    });
};

// src/controllers/package.controller.js

exports.create = (req, res) => {
    const { nama_paket, harga, deskripsi_paket, studio_name, image_url, is_active, waktu_durasi } = req.body;
    
    // Parse Harga
    const parsedHarga = parseInt(harga, 10);

    // Validasi is_active (terima string '1', '0', 'true', 'false', atau boolean)
    let activeStatus = 1; // Default aktif
    if (is_active !== undefined) {
        if (String(is_active) === '0' || String(is_active) === 'false') activeStatus = 0;
        else activeStatus = 1;
    }

    // Validasi waktu_durasi (terima string angka atau null)
    let finalDurasi = null;
    if (waktu_durasi && waktu_durasi !== 'null' && waktu_durasi !== '') {
        const d = parseInt(waktu_durasi, 10);
        if (!isNaN(d) && d > 0) finalDurasi = d;
    }

    if (!nama_paket || isNaN(parsedHarga) || !studio_name || !image_url) {
        return res.status(400).send({ message: "Data wajib (Nama, Harga, Studio, Gambar) tidak lengkap." });
    }

    const newPackage = {
        nama_paket,
        harga: parsedHarga,
        deskripsi_paket,
        studio_name,
        image_url, // URL gambar sudah dikirim dari frontend
        is_active: activeStatus,
        waktu_durasi: finalDurasi
    };

    connection.query("INSERT INTO packages SET ?", newPackage, (err, data) => {
        if (err) {
            console.error("SQL Error:", err);
            return res.status(500).send({ message: "Gagal menyimpan paket." });
        }
        res.send({ id: data.insertId, ...newPackage });
    });
};

exports.update = (req, res) => {
    const packageId = req.params.id;
    const { nama_paket, harga, deskripsi_paket, studio_name, image_url, is_active, waktu_durasi } = req.body;

    const parsedHarga = parseInt(harga, 10);
    
    let activeStatus = 1;
    if (String(is_active) === '0' || String(is_active) === 'false') activeStatus = 0;

    let finalDurasi = null;
    if (waktu_durasi && waktu_durasi !== 'null' && waktu_durasi !== '') {
        const d = parseInt(waktu_durasi, 10);
        if (!isNaN(d) && d > 0) finalDurasi = d;
    }

    const updatedData = {
        nama_paket,
        harga: parsedHarga,
        deskripsi_paket,
        studio_name,
        image_url,
        is_active: activeStatus,
        waktu_durasi: finalDurasi
    };

    connection.query("UPDATE packages SET ? WHERE id = ?", [updatedData, packageId], (err, result) => {
        if (err) return res.status(500).send({ message: err.message });
        res.send({ message: "Paket berhasil diperbarui." });
    });
};

// --- 4. Hapus Paket (Dengan Hapus File Fisik Aman) ---
exports.delete = (req, res) => {
    const packageId = req.params.id;

    // 1. Cari info gambar dulu sebelum hapus data
    connection.query("SELECT image_url FROM packages WHERE id = ?", packageId, (err, result) => {
        if (err) return res.status(500).send({ message: "Error database saat mencari paket." });
        if (result.length === 0) return res.status(404).send({ message: "Paket tidak ditemukan." });

        const imageUrlFromDb = result[0].image_url;

        // 2. Hapus data dari Database
        connection.query("DELETE FROM packages WHERE id = ?", packageId, (delErr) => {
            if (delErr) return res.status(500).send({ message: "Gagal menghapus paket dari database." });

            // 3. Hapus file fisik (Fire & Forget - tidak memblokir respon)
            if (imageUrlFromDb) {
                try {
                    let cleanPath = imageUrlFromDb;
                    
                    // Bersihkan URL jika mengandung domain atau /api/
                    if (cleanPath.includes('/api/')) {
                        cleanPath = cleanPath.split('/api/')[1]; // Ambil bagian setelah /api/
                    }
                    // Hilangkan slash di awal jika ada
                    if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);

                    // Gabungkan dengan path root project
                    const fullPath = path.join(process.cwd(), 'public', cleanPath);
                    
                    console.log("Menghapus file fisik di:", fullPath);

                    if (fs.existsSync(fullPath)) {
                        fs.unlink(fullPath, (unlinkErr) => {
                            if (unlinkErr) console.error("Gagal menghapus file fisik:", unlinkErr);
                        });
                    }
                } catch (pathErr) {
                    console.error("Error saat memproses path file:", pathErr);
                }
            }

            res.send({ message: "Paket berhasil dihapus." });
        });
    });
};

// --- 5. Toggle Status (Aktif/Nonaktif) ---
exports.toggleStatus = (req, res) => {
    const packageId = req.params.id;
    const { is_active } = req.body;
    
    // Pastikan convert ke integer 1 atau 0
    const statusInt = (is_active === true || is_active === 'true' || is_active === 1) ? 1 : 0;

    connection.query("UPDATE packages SET is_active = ? WHERE id = ?", [statusInt, packageId], (err, result) => {
        if (err) {
            console.error("SQL Error Toggle:", err);
            return res.status(500).send({ message: "Gagal update status." });
        }
        res.send({ message: "Status berhasil diubah." });
    });
};