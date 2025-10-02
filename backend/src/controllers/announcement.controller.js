const path = require("path");
const fs = require("fs");
const moment = require("moment");

// ✅ PERBAIKAN: Jalur ke folder tempat gambar pengumuman disimpan
const imagesDir = path.join(__dirname, '..', '..', 'public', 'assets', 'images', 'pengumuman');

const loadAnnouncements = () => {
    try {
        if (!fs.existsSync(imagesDir)) {
            return [];
        }
        const files = fs.readdirSync(imagesDir);
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        
        const loadedData = imageFiles.map((file, index) => ({
            id: index + 1,
            // ✅ PERBAIKAN: Gunakan jalur yang benar
            gambar: `assets/images/pengumuman/${file}`,
            isActive: true,
            addedDate: fs.statSync(path.join(imagesDir, file)).birthtime
        }));

        return loadedData;
    } catch (error) {
        console.error("Error reading images directory:", error);
        return [];
    }
};

let announcementData = loadAnnouncements();
let nextId = announcementData.length > 0 ? Math.max(...announcementData.map(a => a.id)) + 1 : 1;

exports.create = (req, res) => {
    try {
        const { isActive } = req.body;
        
        let gambarPath = '';
        if (req.file) {
            // ✅ PERBAIKAN: Gunakan jalur yang benar
            gambarPath = `assets/images/pengumuman/${req.file.filename}`;
        } else if (req.body.gambar) {
            gambarPath = req.body.gambar;
        } else {
            return res.status(400).send({ message: "File gambar atau URL gambar diperlukan." });
        }

        const newAnnouncement = { 
            id: nextId++, 
            gambar: gambarPath, 
            isActive: isActive === 'true' || isActive === true, 
            addedDate: new Date() 
        };
        
        announcementData.push(newAnnouncement);
        res.status(201).send(newAnnouncement);

    } catch (error) {
        console.error("Error creating announcement:", error);
        res.status(500).send({ message: "Terjadi kesalahan saat membuat pengumuman." });
    }
};

exports.findAll = (req, res) => {
    const activeBanners = announcementData.filter(a => a.isActive);
    res.send(activeBanners);
};

exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const index = announcementData.findIndex(a => a.id === id);
    if (index === -1) {
        return res.status(404).send({ message: "Pengumuman tidak ditemukan." });
    }
    
    const updates = req.body;
    if (req.file) {
        // ✅ PERBAIKAN: Gunakan jalur yang benar
        updates.gambar = `assets/images/pengumuman/${req.file.filename}`;
    }

    if (updates.isActive !== undefined) {
        updates.isActive = updates.isActive === 'true' || updates.isActive === true;
    }

    announcementData[index] = { ...announcementData[index], ...updates };
    res.send(announcementData[index]);
};

exports.delete = (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = announcementData.length;
    const itemToDelete = announcementData.find(a => a.id === id);
    
    if (!itemToDelete) {
        return res.status(404).send({ message: "Pengumuman tidak ditemukan." });
    }
    
    // ✅ PERBAIKAN: Periksa jalur yang benar sebelum menghapus
    if (itemToDelete.gambar && itemToDelete.gambar.startsWith('assets/images/pengumuman')) {
        const filePath = path.join(__dirname, '..', '..', 'public', itemToDelete.gambar);
        fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting image file:", err);
        });
    }

    announcementData = announcementData.filter(a => a.id !== id);
    
    if (announcementData.length < initialLength) {
        res.send({ message: "Pengumuman berhasil dihapus." });
    } else {
        res.status(404).send({ message: "Pengumuman tidak ditemukan." });
    }
};