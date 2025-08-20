const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const connection = require("../db.js");

const jwtSecret = "your-secret-key"; 

exports.register = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: "Username dan password diperlukan." });
    }

    // Hash password sebelum menyimpannya ke database
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send({ message: "Gagal mengenkripsi password." });
        }

        const query = "INSERT INTO admin (username, password) VALUES (?, ?)";
        connection.query(query, [username, hash], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).send({ message: "Username sudah terdaftar." });
                }
                return res.status(500).send({ message: "Terjadi kesalahan server saat mendaftar." });
            }
            res.status(201).send({ message: "Pendaftaran berhasil!" });
        });
    });
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send({ message: "Username dan password diperlukan." });
    }

    const query = "SELECT * FROM admin WHERE username = ?";
    connection.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).send({ message: "Terjadi kesalahan server." });
        }
        if (results.length === 0) {
            return res.status(401).send({ message: "Username atau password salah." });
        }

        const admin = results[0];
        // Bandingkan password yang dimasukkan dengan password yang sudah di-hash
        bcrypt.compare(password, admin.password, (err, isMatch) => {
            if (err) {
                return res.status(500).send({ message: "Terjadi kesalahan server." });
            }
            if (!isMatch) {
                return res.status(401).send({ message: "Username atau password salah." });
            }

            const token = jwt.sign({ id: admin.id, username: admin.username }, jwtSecret, { expiresIn: '1h' });
            res.send({ message: "Login berhasil!", token });
        });
    });
};
