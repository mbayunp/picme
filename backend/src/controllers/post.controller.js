// src/controllers/post.controller.js
const connection = require('../db.js');
const fs = require('fs');
const path = require('path');

exports.findAll = (req, res) => {
    const query = "SELECT * FROM posts ORDER BY created_at DESC";
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching posts:", err);
            return res.status(500).send({ message: err.message || "Error mengambil postingan." });
        }
        res.send(results);
    });
};

// Fungsi baru untuk mengambil satu postingan berdasarkan ID
exports.findOne = (req, res) => {
    const postId = req.params.id;
    const query = "SELECT * FROM posts WHERE id = ?";
    connection.query(query, [postId], (err, results) => {
        if (err) {
            console.error("Error fetching post:", err);
            return res.status(500).send({ message: err.message || "Error mengambil postingan." });
        }
        if (results.length === 0) {
            return res.status(404).send({ message: "Postingan tidak ditemukan." });
        }
        res.send(results[0]);
    });
};

exports.create = (req, res) => {
    const { title, content } = req.body;
    const image_url = req.file ? req.file.filename : null;

    if (!title || !content || !image_url) {
        return res.status(400).send({ message: "Judul, konten, dan gambar tidak boleh kosong." });
    }

    const newPost = { title, content, image_url };
    connection.query("INSERT INTO posts SET ?", newPost, (err, data) => {
        if (err) {
            console.error("Error creating post:", err);
            return res.status(500).send({ message: err.message || "Error membuat postingan." });
        }
        res.status(201).send({
            id: data.insertId,
            title,
            content,
            image_url: image_url,
        });
    });
};

exports.update = (req, res) => {
    const postId = req.params.id;
    const { title, content } = req.body;
    const image_file = req.file;

    connection.query("SELECT image_url FROM posts WHERE id = ?", [postId], (err, rows) => {
        if (err) {
            console.error("Error fetching old image:", err);
            return res.status(500).send({ message: "Error server." });
        }
        const oldImage = rows[0]?.image_url;

        let newImageUrl = oldImage;
        if (image_file) {
            newImageUrl = image_file.filename;
            if (oldImage) {
                const oldPath = path.join(__dirname, '..', '..', 'public', 'assets', 'images', oldImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, err => {
                        if (err) console.error("Error menghapus file lama:", err);
                    });
                }
            }
        }

        connection.query(
            "UPDATE posts SET title = ?, content = ?, image_url = ? WHERE id = ?",
            [title, content, newImageUrl, postId],
            (err2, result) => {
                if (err2) {
                    console.error("Error update post:", err2);
                    return res.status(500).send({ message: "Error memperbarui postingan." });
                }
                if (result.affectedRows === 0) {
                    return res.status(404).send({ message: "Postingan tidak ditemukan." });
                }
                res.send({
                    message: "Postingan berhasil diperbarui!",
                    image_url: newImageUrl,
                });
            }
        );
    });
};

exports.delete = (req, res) => {
    const postId = req.params.id;
    connection.query("SELECT image_url FROM posts WHERE id = ?", [postId], (err, rows) => {
        if (err) {
            console.error("Error fetching image to delete:", err);
            return res.status(500).send({ message: "Error server." });
        }
        const imageUrl = rows[0]?.image_url;
        connection.query("DELETE FROM posts WHERE id = ?", [postId], (err2, result) => {
            if (err2) {
                console.error("Error deleting post:", err2);
                return res.status(500).send({ message: "Error menghapus postingan." });
            }
            if (imageUrl) {
                const filePath = path.join(__dirname, '..', '..', 'public', 'assets', 'images', imageUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, errDel => {
                        if (errDel) console.error("Error menghapus file gambar:", errDel);
                    });
                }
            }
            res.send({ message: "Postingan berhasil dihapus." });
        });
    });
};