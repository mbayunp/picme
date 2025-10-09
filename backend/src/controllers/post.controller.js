// src/controllers/post.controller.js

const connection = require('../db.js');
const fs = require('fs');
const path = require('path');

// Fungsi untuk menangani pemrosesan media_url (JSON string ke Array)
const processPostMedia = (post) => {
    if (post.media_url && typeof post.media_url === 'string') {
        try {
            // Coba parse string JSON menjadi array
            post.media_url = JSON.parse(post.media_url);
        } catch (e) {
            // Jika gagal parse, biarkan sebagai string (mungkin itu URL video tunggal)
        }
    }
    return post;
};

exports.findAll = (req, res) => {
    const query = "SELECT *, media_url FROM posts ORDER BY created_at DESC"; 
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching posts:", err);
            return res.status(500).send({ message: err.message || "Error mengambil postingan." });
        }
        
        const processedResults = results.map(processPostMedia);
        res.send(processedResults);
    });
};

exports.findOne = (req, res) => {
    const postId = req.params.id;
    const query = "SELECT *, media_url FROM posts WHERE id = ?";
    connection.query(query, [postId], (err, results) => {
        if (err) {
            console.error("Error fetching post:", err);
            return res.status(500).send({ message: err.message || "Error mengambil postingan." });
        }
        if (results.length === 0) {
            return res.status(404).send({ message: "Postingan tidak ditemukan." });
        }
        
        const post = processPostMedia(results[0]);
        res.send(post);
    });
};

exports.create = (req, res) => {
    const { title, content, media_url } = req.body; 
    
    // Dapatkan nama file dari req.files
    const image_url = req.files.image?.[0]?.filename || null;
    const slides = req.files.slides?.map(file => file.filename) || null;

    if (!title || !content) {
        return res.status(400).send({ message: "Judul dan konten tidak boleh kosong." });
    }
    
    let mediaUrlToSave = null;
    if (slides) {
        // Jika ada unggahan slide, simpan sebagai string JSON dari array nama file
        mediaUrlToSave = JSON.stringify(slides);
    } else if (media_url) {
        // Jika tidak ada slide, cek media_url lama (untuk video)
        mediaUrlToSave = media_url;
    }

    const newPost = { 
        title, 
        content, 
        image_url,
        media_url: mediaUrlToSave
    };

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
            media_url: mediaUrlToSave
        });
    });
};

exports.update = (req, res) => {
    const postId = req.params.id;
    const { title, content, media_url } = req.body;
    // Ambil file dari req.files
    const image_file = req.files.image?.[0];
    const slides = req.files.slides?.map(file => file.filename);

    connection.query("SELECT image_url, media_url FROM posts WHERE id = ?", [postId], (err, rows) => {
        if (err) {
            console.error("Error fetching old media:", err);
            return res.status(500).send({ message: "Error server." });
        }
        
        const oldImage = rows[0]?.image_url;
        const oldMediaUrl = rows[0]?.media_url;

        let newImageUrl = oldImage;
        let newMediaUrl = oldMediaUrl;
        
        // Hapus file lama jika ada unggahan gambar baru
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

        // Jika ada unggahan slide baru, hapus slide lama dan simpan yang baru
        if (slides) {
            if (oldMediaUrl) {
                try {
                    const oldSlides = JSON.parse(oldMediaUrl);
                    if (Array.isArray(oldSlides)) {
                        oldSlides.forEach(slide => {
                            const oldPath = path.join(__dirname, '..', '..', 'public', 'assets', 'images', slide);
                            if (fs.existsSync(oldPath)) {
                                fs.unlink(oldPath, err => {
                                    if (err) console.error("Error menghapus file slide lama:", err);
                                });
                            }
                        });
                    }
                } catch(e) { /* Abaikan jika bukan JSON array */ }
            }
            newMediaUrl = JSON.stringify(slides);
        } else if (media_url !== undefined) {
            newMediaUrl = media_url;
        }

        connection.query(
            "UPDATE posts SET title = ?, content = ?, image_url = ?, media_url = ? WHERE id = ?",
            [title, content, newImageUrl, newMediaUrl, postId],
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
                    media_url: newMediaUrl,
                });
            }
        );
    });
};

exports.delete = (req, res) => {
    const postId = req.params.id;
    connection.query("SELECT image_url, media_url FROM posts WHERE id = ?", [postId], (err, rows) => {
        if (err) {
            console.error("Error fetching media to delete:", err);
            return res.status(500).send({ message: "Error server." });
        }
        
        const imageUrl = rows[0]?.image_url;
        const mediaUrl = rows[0]?.media_url;

        connection.query("DELETE FROM posts WHERE id = ?", [postId], (err2, result) => {
            if (err2) {
                console.error("Error deleting post:", err2);
                return res.status(500).send({ message: "Error menghapus postingan." });
            }
            
            // Hapus file gambar tunggal
            if (imageUrl) {
                const filePath = path.join(__dirname, '..', '..', 'public', 'assets', 'images', imageUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, errDel => {
                        if (errDel) console.error("Error menghapus file gambar:", errDel);
                    });
                }
            }

            // Hapus file slide jika ada
            if (mediaUrl) {
                try {
                    const slides = JSON.parse(mediaUrl);
                    if (Array.isArray(slides)) {
                        slides.forEach(slide => {
                            const filePath = path.join(__dirname, '..', '..', 'public', 'assets', 'images', slide);
                            if (fs.existsSync(filePath)) {
                                fs.unlink(filePath, errDel => {
                                    if (errDel) console.error("Error menghapus file slide:", errDel);
                                });
                            }
                        });
                    }
                } catch (e) { /* Abaikan jika media_url bukan array JSON */ }
            }

            res.send({ message: "Postingan berhasil dihapus." });
        });
    });
};