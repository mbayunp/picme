const connection = require("../db.js");
const fs = require('fs');
const path = require('path');

exports.findAll = (req, res) => {
    // Mengambil semua postingan dari database
    const query = "SELECT * FROM posts ORDER BY created_at DESC";
    connection.query(query, (err, data) => {
        if (err) {
            console.error("Error fetching posts:", err);
            res.status(500).send({ message: err.message || "Terjadi kesalahan saat mengambil data postingan." });
        } else {
            res.send(data);
        }
    });
};

exports.create = (req, res) => {
    // Membuat postingan baru
    const { title, content } = req.body;
    const image_url = req.file ? req.file.filename : null;

    if (!title || !content) {
        return res.status(400).send({ message: "Judul dan konten tidak boleh kosong." });
    }

    const newPost = {
        title: title,
        content: content,
        image_url: image_url
    };

    const query = "INSERT INTO posts SET ?";
    connection.query(query, newPost, (err, data) => {
        if (err) {
            console.error("Error creating post:", err);
            res.status(500).send({ message: err.message || "Terjadi kesalahan saat membuat postingan." });
        } else {
            res.status(201).send({ id: data.insertId, ...newPost, message: "Postingan berhasil dibuat!" });
        }
    });
};

// Fungsi untuk memperbarui postingan
exports.update = (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    const newImage = req.file;

    const getOldImageQuery = "SELECT image_url FROM posts WHERE id = ?";
    connection.query(getOldImageQuery, postId, (err, results) => {
        if (err) {
            return res.status(500).send({ message: "Terjadi kesalahan server." });
        }
        const oldImage = results[0]?.image_url;

        let image_url = oldImage;
        if (newImage) {
            image_url = newImage.filename;
            // Hapus gambar lama jika ada
            if (oldImage) {
                const oldImagePath = path.join(__dirname, '../../frontend/src/assets/images/', oldImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        const updateQuery = "UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?";
        connection.query(updateQuery, [title, content, image_url, postId], (err, result) => {
            if (err) {
                console.error("Error updating post:", err);
                return res.status(500).send({ message: "Terjadi kesalahan saat memperbarui postingan." });
            }
            if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Postingan tidak ditemukan." });
            }
            res.send({ message: "Postingan berhasil diperbarui!" });
        });
    });
};

// PERBAIKAN: Tambahkan logika penghapusan file
exports.delete = (req, res) => {
    const postId = req.params.id;

    // Pertama, ambil nama file gambar dari database
    const getImageUrlQuery = "SELECT image_url FROM posts WHERE id = ?";
    connection.query(getImageUrlQuery, postId, (err, results) => {
        if (err) {
            console.error("Error fetching image URL:", err);
            return res.status(500).send({ message: "Terjadi kesalahan saat mengambil URL gambar." });
        }
        
        const imageUrl = results.length > 0 ? results[0].image_url : null;
        
        // Hapus postingan dari database
        const deleteQuery = "DELETE FROM posts WHERE id = ?";
        connection.query(deleteQuery, postId, (err, result) => {
            if (err) {
                console.error("Error deleting post:", err);
                return res.status(500).send({ message: "Terjadi kesalahan saat menghapus postingan." });
            } else if (result.affectedRows === 0) {
                return res.status(404).send({ message: "Postingan tidak ditemukan." });
            }

            // Hapus file gambar dari server jika ada
            if (imageUrl) {
                const filePath = path.join(__dirname, '../../frontend/src/assets/images/', imageUrl);
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error("Gagal menghapus file gambar:", unlinkErr);
                    }
                    console.log("File gambar berhasil dihapus.");
                });
            }

            res.send({ message: "Postingan berhasil dihapus." });
        });
    });
};
