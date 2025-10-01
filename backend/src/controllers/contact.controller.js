// src/controllers/contact.controller.js
const connection = require("../db.js");

// ✅ Fungsi untuk menyimpan pesan dari form kontak
exports.create = (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send({ message: "Semua field harus diisi." });
    }
    
    const newContactMessage = { name, email, message };

    connection.query("INSERT INTO contact_messages SET ?", newContactMessage, (err, data) => {
        if (err) {
            console.error("❌ Error creating contact message:", err.sqlMessage);
            return res.status(500).send({
                message: `Terjadi kesalahan saat menyimpan pesan: ${err.sqlMessage}`,
                error: err.sqlMessage,
            });
        }
        res.status(201).send({ id: data.insertId, ...newContactMessage, message: "Pesan berhasil terkirim!" });
    });
};

// ✅ Fungsi baru untuk mengambil semua pesan kontak
exports.findAll = (req, res) => {
    const query = "SELECT * FROM contact_messages ORDER BY created_at DESC";
    connection.query(query, (err, data) => {
        if (err) {
            console.error("❌ Error fetching contact messages:", err.sqlMessage);
            return res.status(500).send({
                message: "Terjadi kesalahan saat mengambil pesan kontak.",
                error: err.sqlMessage,
            });
        }
        res.send(data);
    });
};