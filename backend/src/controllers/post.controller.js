// src/controllers/post.controller.js
const connection = require('../db.js');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert callback ke promise
const query = util.promisify(connection.query).bind(connection);
const unlink = util.promisify(fs.unlink);

// Folder upload
const uploadDir = path.join(__dirname, '..', '..', 'public', 'assets', 'images');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Helper: parsing JSON media_url
const processPostMedia = (post) => {
  if (typeof post.media_url === 'string' && post.media_url.startsWith('[')) {
    try {
      post.media_url = JSON.parse(post.media_url);
    } catch (e) {
      console.warn("Invalid JSON in media_url:", post.media_url);
    }
  }
  return post;
};

// Helper: hapus file dengan aman
const safeDeleteFile = async (filename) => {
  if (!filename) return;
  const filePath = path.join(uploadDir, path.basename(filename));
  if (fs.existsSync(filePath)) {
    try {
      await unlink(filePath);
    } catch (err) {
      console.error("Gagal hapus file:", filename, err);
    }
  }
};

// 📜 GET semua postingan
exports.findAll = async (req, res) => {
  try {
    const results = await query("SELECT * FROM posts ORDER BY created_at DESC");
    const processed = results.map(processPostMedia);
    res.send(processed);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).send({ message: "Gagal mengambil daftar postingan." });
  }
};

// 📄 GET 1 postingan + prev & next
exports.findOne = async (req, res) => {
  const postId = Number(req.params.id);
  if (isNaN(postId)) return res.status(400).send({ message: "ID tidak valid." });

  try {
    const posts = await query("SELECT * FROM posts WHERE id = ?", [postId]);
    if (posts.length === 0) return res.status(404).send({ message: "Postingan tidak ditemukan." });

    const post = processPostMedia(posts[0]);

    const [prev] = await query("SELECT id FROM posts WHERE id < ? ORDER BY id DESC LIMIT 1", [postId]);
    const [next] = await query("SELECT id FROM posts WHERE id > ? ORDER BY id ASC LIMIT 1", [postId]);

    res.send({
      post,
      prevId: prev ? prev.id : null,
      nextId: next ? next.id : null,
    });
  } catch (err) {
    console.error("Error fetching post detail:", err);
    res.status(500).send({ message: "Gagal mengambil detail postingan." });
  }
};

// 🆕 CREATE postingan
exports.create = async (req, res) => {
  try {
    const { title, content, media_url } = req.body;
    if (!title || !content) {
      return res.status(400).send({ message: "Judul dan konten wajib diisi." });
    }

    const imageFile = req.files.image?.[0]?.filename || null;
    const slideFiles = req.files.slides?.map(f => f.filename) || [];
    const mediaToSave = slideFiles.length ? JSON.stringify(slideFiles) : media_url || null;

    const newPost = { title, content, image_url: imageFile, media_url: mediaToSave };
    const result = await query("INSERT INTO posts SET ?", newPost);

    res.status(201).send({ id: result.insertId, ...newPost });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).send({ message: "Gagal membuat postingan." });
  }
};

// ✏️ UPDATE postingan
exports.update = async (req, res) => {
  const postId = Number(req.params.id);
  if (isNaN(postId)) return res.status(400).send({ message: "ID tidak valid." });

  try {
    const { title, content } = req.body;
    const existingSlides = req.body.existing_slides ? JSON.parse(req.body.existing_slides || '[]') : [];
    const newImageFile = req.files.image?.[0]?.filename || null;
    const newSlides = req.files.slides?.map(f => f.filename) || [];

    const oldRows = await query("SELECT image_url, media_url FROM posts WHERE id = ?", [postId]);
    if (oldRows.length === 0) return res.status(404).send({ message: "Postingan tidak ditemukan." });

    const oldData = oldRows[0];
    let imageUrl = oldData.image_url;
    const finalSlides = [...existingSlides, ...newSlides];
    const mediaUrl = finalSlides.length ? JSON.stringify(finalSlides) : null;

    // Hapus image lama jika ada yang baru
    if (newImageFile) {
      await safeDeleteFile(oldData.image_url);
      imageUrl = newImageFile;
    }

    // Hapus slide lama yang sudah tidak dipakai
    if (oldData.media_url) {
      try {
        const oldSlides = JSON.parse(oldData.media_url);
        const toDelete = oldSlides.filter(s => !existingSlides.includes(s));
        await Promise.all(toDelete.map(safeDeleteFile));
      } catch (e) {
        console.warn("Gagal parse media lama:", e);
      }
    }

    // Update database
    await query(
      "UPDATE posts SET title=?, content=?, image_url=?, media_url=? WHERE id=?",
      [title, content, imageUrl, mediaUrl, postId]
    );

    res.send({
      message: "Postingan berhasil diperbarui!",
      updated: { title, content, image_url: imageUrl, media_url: mediaUrl },
    });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).send({ message: "Gagal memperbarui postingan." });
  }
};

// 🗑️ DELETE postingan
exports.delete = async (req, res) => {
  const postId = Number(req.params.id);
  if (isNaN(postId)) return res.status(400).send({ message: "ID tidak valid." });

  try {
    const rows = await query("SELECT image_url, media_url FROM posts WHERE id = ?", [postId]);
    if (rows.length === 0) return res.status(404).send({ message: "Postingan tidak ditemukan." });

    const { image_url, media_url } = rows[0];
    await query("DELETE FROM posts WHERE id = ?", [postId]);

    await safeDeleteFile(image_url);
    if (media_url) {
      try {
        const slides = JSON.parse(media_url);
        if (Array.isArray(slides)) {
          await Promise.all(slides.map(safeDeleteFile));
        }
      } catch (e) {
        console.warn("media_url bukan JSON array:", media_url);
      }
    }

    res.send({ message: "Postingan berhasil dihapus." });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).send({ message: "Gagal menghapus postingan." });
  }
};
