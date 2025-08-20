// src/db.js
const mysql = require("mysql2");
const dbConfig = require("./config/db.config.js");

// Buat koneksi pool agar lebih efisien
const connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verifikasi koneksi
connection.getConnection((err, conn) => {
    if (err) {
        console.error("Error connecting to the database: " + err.stack);
        return;
    }
    console.log("Successfully connected to the database as id " + conn.threadId);
    conn.release(); // Lepaskan koneksi setelah verifikasi
});

module.exports = connection;