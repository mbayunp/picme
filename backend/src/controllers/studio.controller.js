// File Baru: src/controllers/studio.controller.js

const connection = require("../db.js"); // Pastikan path ini sesuai dengan struktur proyek Anda

/**
 * Mengambil semua data studio dari database.
 */
exports.findAll = (req, res) => {
    const query = "SELECT * FROM studios ORDER BY name ASC";

    connection.query(query, (err, data) => {
        if (err) {
            console.error("Error fetching studios:", err);
            res.status(500).send({ 
                message: err.message || "Terjadi kesalahan saat mengambil data studio." 
            });
        } else {
            res.status(200).send(data);
        }
    });
};