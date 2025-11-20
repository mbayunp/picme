const connection = require('../db.js');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Promisify query
const query = util.promisify(connection.query).bind(connection);

// --- Helper Functions ---

// Parsing aman untuk media_url (bisa berupa string URL atau JSON array)
const parseMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return null;
    try {
        // Coba parse jika terlihat seperti array JSON
        if (mediaUrl.trim().startsWith('[')) {
            return JSON.parse(mediaUrl);
        }
        return mediaUrl; // Jika bukan JSON, kembalikan string aslinya
    } catch (e) {
        console.warn("Gagal parse media_url:", e);
        return mediaUrl;
    }
};

// Hapus file fisik (Robust)
const deletePhysicalFile = (fileUrl) => {
    if (!fileUrl) return;
    try {
        // Ambil path relatif dari URL (misal: /assets/images/foto.jpg -> public/assets/images/foto.jpg)
        let cleanPath = fileUrl;
        if (cleanPath.includes('/assets/')) {
            cleanPath = 'assets' + cleanPath.split('/assets')[1];
        }
        // Gabungkan dengan root project
        const fullPath = path.join(process.cwd(), 'public', cleanPath);
        
        if (fs.existsSync(fullPath)) {
            fs.unlink(fullPath, (err) => {
                if (err) console.error("Gagal hapus file:", fullPath, err);
            });
        }
    } catch (e) {
        console.error("Error deletePhysicalFile:", e);
    }
};


// --- CRUD Functions ---

// 1. GET Semua Post
exports.findAll = async (req, res) => {
    try {
        const results = await query("SELECT * FROM posts ORDER BY created_at DESC");
        const processed = results.map(post => ({
            ...post,
            media_url: parseMediaUrl(post.media_url)
        }));
        res.send(processed);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send({ message: "Gagal mengambil data." });
    }
};

// 2. GET Satu Post
exports.findOne = async (req, res) => {
    const postId = Number(req.params.id);
    if (isNaN(postId)) return res.status(400).send({ message: "ID tidak valid." });

    try {
        const posts = await query("SELECT * FROM posts WHERE id = ?", [postId]);
        if (posts.length === 0) return res.status(404).send({ message: "Postingan tidak ditemukan." });

        const post = {
            ...posts[0],
            media_url: parseMediaUrl(posts[0].media_url)
        };

        const [prev] = await query("SELECT id FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1", [postId]);
        const [next] = await query("SELECT id FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1", [postId]);

        res.send({ post, prevId: prev?.id || null, nextId: next?.id || null });
    } catch (err) {
        res.status(500).send({ message: "Error server." });
    }
};

// 3. CREATE Post (Menerima URL gambar yang sudah diupload)
exports.create = async (req, res) => {
    try {
        // Frontend mengirim 'media_url' sebagai string (URL tunggal) atau string JSON (array URL)
        const { title, content, image_url, media_url } = req.body;

        if (!title || !content) {
            return res.status(400).send({ message: "Judul dan konten wajib diisi." });
        }

        const newPost = {
            title,
            content,
            image_url: image_url || null, // URL thumbnail
            media_url: media_url || null  // URL video atau JSON array slide
        };

        const result = await query("INSERT INTO posts SET ?", newPost);
        res.status(201).send({ id: result.insertId, ...newPost });

    } catch (err) {
        console.error("Error create post:", err);
        res.status(500).send({ message: "Gagal membuat postingan." });
    }
};

// 4. UPDATE Post
exports.update = async (req, res) => {
    const postId = Number(req.params.id);
    const { title, content, image_url, media_url } = req.body;

    try {
        // Cek data lama untuk hapus file sampah (opsional, tapi bagus untuk kebersihan server)
        const oldRows = await query("SELECT image_url, media_url FROM posts WHERE id = ?", [postId]);
        if (oldRows.length > 0) {
            const oldData = oldRows[0];
            
            // Jika image_url berubah, hapus yang lama
            if (oldData.image_url && oldData.image_url !== image_url) {
                deletePhysicalFile(oldData.image_url);
            }
            
            // Logika hapus slide lama agak kompleks, bisa di-skip untuk MVP agar aman
            // atau diimplementasikan dengan hati-hati membandingkan array lama vs baru
        }

        await query(
            "UPDATE posts SET title=?, content=?, image_url=?, media_url=? WHERE id=?",
            [title, content, image_url, media_url, postId]
        );

        res.send({ message: "Postingan diperbarui!" });

    } catch (err) {
        console.error("Error update post:", err);
        res.status(500).send({ message: "Gagal memperbarui postingan." });
    }
};

// 5. DELETE Post
exports.delete = async (req, res) => {
    const postId = Number(req.params.id);

    try {
        const rows = await query("SELECT image_url, media_url FROM posts WHERE id = ?", [postId]);
        if (rows.length === 0) return res.status(404).send({ message: "Tidak ditemukan." });

        const { image_url, media_url } = rows[0];

        // Hapus dari DB dulu
        await query("DELETE FROM posts WHERE id = ?", [postId]);

        // Hapus File Fisik (Thumbnail)
        if (image_url) deletePhysicalFile(image_url);

        // Hapus File Fisik (Slides)
        const parsedMedia = parseMediaUrl(media_url);
        if (Array.isArray(parsedMedia)) {
            parsedMedia.forEach(deletePhysicalFile);
        }

        res.send({ message: "Berhasil dihapus." });

    } catch (err) {
        console.error("Error delete post:", err);
        res.status(500).send({ message: "Gagal menghapus." });
    }
};