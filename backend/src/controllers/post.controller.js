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

// Ganti fungsi findOne Anda di post.controller.js dengan yang ini
exports.findOne = (req, res) => {
    const postId = parseInt(req.params.id, 10);

    // 1. Query untuk mengambil postingan saat ini
    const postQuery = "SELECT * FROM posts WHERE id = ?";
    
    // 2. Query untuk mengambil ID postingan SEBELUMNYA
    // (ID terbesar yang lebih kecil dari ID saat ini)
    const prevQuery = "SELECT id FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1";
    
    // 3. Query untuk mengambil ID postingan SELANJUTNYA
    // (ID terkecil yang lebih besar dari ID saat ini)
    const nextQuery = "SELECT id FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1";

    connection.query(postQuery, [postId], (err, postResults) => {
        if (err) {
            console.error("Error fetching post:", err);
            return res.status(500).send({ message: "Error mengambil postingan." });
        }
        if (postResults.length === 0) {
            return res.status(404).send({ message: "Postingan tidak ditemukan." });
        }

        const post = processPostMedia(postResults[0]); // processPostMedia dari kode Anda sebelumnya

        // Jalankan query untuk navigasi
        connection.query(prevQuery, [postId], (err, prevResults) => {
            if (err) return res.status(500).send({ message: "Error mengambil navigasi sebelumnya." });
            
            connection.query(nextQuery, [postId], (err, nextResults) => {
                if (err) return res.status(500).send({ message: "Error mengambil navigasi selanjutnya." });

                const prevId = prevResults[0] ? prevResults[0].id : null;
                const nextId = nextResults[0] ? nextResults[0].id : null;

                // Kirim respons dalam format baru yang diharapkan frontend
                res.send({
                    post: post,
                    prevId: prevId,
                    nextId: nextId
                });
            });
        });
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

    // 1. Ambil semua data yang relevan dari request
    const { title, content } = req.body;
    
    // Ambil urutan baru dari slide lama (ini adalah string, perlu di-parse)
    const newlyOrderedOldSlides = req.body.existing_slides ? JSON.parse(req.body.existing_slides) : [];
    
    // Ambil file baru yang diunggah
    const newImageFile = req.files.image?.[0];
    const newSlideFiles = req.files.slides?.map(file => file.filename) || [];

    // Query untuk mengambil data lama dari database
    connection.query("SELECT image_url, media_url FROM posts WHERE id = ?", [postId], (err, rows) => {
        if (err || rows.length === 0) {
            console.error("Error fetching old post data:", err);
            return res.status(500).send({ message: "Error mengambil data postingan lama." });
        }
        
        const oldData = rows[0];
        let newImageUrl = oldData.image_url;

        // 2. Logika untuk menggabungkan slide lama dan baru
        const finalSlides = [...newlyOrderedOldSlides, ...newSlideFiles];
        const newMediaUrl = finalSlides.length > 0 ? JSON.stringify(finalSlides) : null;

        // 3. Logika untuk menghapus file lama yang tidak terpakai
        // Hapus thumbnail lama jika ada yang baru
        if (newImageFile) {
            newImageUrl = newImageFile.filename;
            if (oldData.image_url) {
                const oldImagePath = path.join(uploadDir, oldData.image_url);
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
        }

        // Hapus file slide lama yang sudah tidak ada di daftar baru
        if (oldData.media_url) {
            try {
                const oldSlides = JSON.parse(oldData.media_url);
                if (Array.isArray(oldSlides)) {
                    const slidesToDelete = oldSlides.filter(oldSlide => !newlyOrderedOldSlides.includes(oldSlide));
                    slidesToDelete.forEach(slideName => {
                        const oldSlidePath = path.join(uploadDir, slideName);
                        if (fs.existsSync(oldSlidePath)) fs.unlinkSync(oldSlidePath);
                    });
                }
            } catch (e) { /* Abaikan jika bukan JSON */ }
        }

        // 4. Update database dengan semua data yang sudah benar
        connection.query(
            "UPDATE posts SET title = ?, content = ?, image_url = ?, media_url = ? WHERE id = ?",
            [title, content, newImageUrl, newMediaUrl, postId],
            (err2, result) => {
                if (err2) {
                    console.error("Error updating post:", err2);
                    return res.status(500).send({ message: "Error memperbarui postingan." });
                }
                res.send({ message: "Postingan berhasil diperbarui!" });
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