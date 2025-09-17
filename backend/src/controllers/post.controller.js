// controllers/post.controller.js
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
    const postsWithImageUrl = results.map(post => ({
      ...post,
      image_url: post.image_url
        ? `${req.protocol}://${req.get('host')}/assets/images/${post.image_url}`
        : null,
    }));
    res.send(postsWithImageUrl);
  });
};

exports.create = (req, res) => {
  const { title, content } = req.body;
  const image = req.file;
  const image_url = image ? image.filename : null;

  if (!title || !content) {
    return res.status(400).send({ message: "Judul dan konten tidak boleh kosong." });
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
      image_url: image_url ? `${req.protocol}://${req.get('host')}/assets/images/${image_url}` : null,
    });
  });
};

exports.update = (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const image = req.file;

  connection.query("SELECT image_url FROM posts WHERE id = ?", [postId], (err, rows) => {
    if (err) {
      console.error("Error fetch old image:", err);
      return res.status(500).send({ message: "Error server." });
    }
    const oldImage = rows[0]?.image_url;

    let newImageUrl = oldImage;
    if (image) {
      newImageUrl = image.filename;
      if (oldImage) {
        const oldPath = path.join(__dirname, '..', 'public', 'images', oldImage);
        fs.unlink(oldPath, err => {
          if (err) console.error("Error menghapus file lama:", err);
        });
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
          image_url: newImageUrl ? `${req.protocol}://${req.get('host')}/assets/images/${newImageUrl}` : null,
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
        const filePath = path.join(__dirname, '..', 'public', 'images', imageUrl);
        fs.unlink(filePath, errDel => {
          if (errDel) console.error("Error menghapus file gambar:", errDel);
        });
      }
      res.send({ message: "Postingan berhasil dihapus." });
    });
  });
};
