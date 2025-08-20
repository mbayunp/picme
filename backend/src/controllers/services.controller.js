// src/controllers/services.controller.js

const connection = require("../db.js");

exports.getAvailableSlots = (req, res) => {
    const { date, studio } = req.query;

    if (!date || !studio) {
        return res.status(400).send({ message: "Tanggal dan studio diperlukan untuk mencari slot." });
    }

    const query = "SELECT waktu_mulai, waktu_selesai FROM services WHERE tanggal = ? AND studio_name = ?";
    
    connection.query(query, [date, studio], (err, bookedSlots) => {
        if (err) {
            console.error("Error fetching booked slots:", err);
            return res.status(500).send({ message: "Terjadi kesalahan saat mengambil data jadwal." });
        }

        const allSlots = generateTimeSlots("09:00", "17:00", 15);
        
        const availableSlots = allSlots.map(slot => {
            const isBooked = bookedSlots.some(booked => {
                const bookedStart = booked.waktu_mulai.split(':').slice(0, 2).join(':');
                const bookedEnd = booked.waktu_selesai.split(':').slice(0, 2).join(':');
                
                return slot.time >= bookedStart && slot.time < bookedEnd;
            });
            return {
                time: slot.time,
                isAvailable: !isBooked
            };
        });

        res.send(availableSlots);
    });
};

exports.create = (req, res) => {
    if (!req.body || !req.body.nama || !req.body.tanggal || !req.body.waktu_mulai || !req.body.studio_name) {
        return res.status(400).send({ message: "Data pemesanan tidak lengkap!" });
    }

    const newBooking = {
        nama: req.body.nama,
        email: req.body.email,
        nomor_whatsapp: req.body.nomor_whatsapp,
        tanggal: req.body.tanggal,
        waktu_mulai: req.body.waktu_mulai,
        waktu_selesai: req.body.waktu_selesai,
        jumlah_orang: req.body.jumlah_orang,
        studio_name: req.body.studio_name
    };

    connection.query("INSERT INTO services SET ?", newBooking, (err, data) => {
        if (err) {
            console.error("Error creating booking:", err);
            return res.status(500).send({ message: "Terjadi kesalahan saat menyimpan pemesanan." });
        }
        res.status(201).send({ id: data.insertId, ...newBooking, message: "Pemesanan berhasil dibuat!" });
    });
};

// Tambahkan fungsi findAll ini untuk mengambil semua pemesanan
exports.findAll = (req, res) => {
    const query = "SELECT * FROM services ORDER BY tanggal DESC, waktu_mulai DESC";
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching all bookings:", err);
            return res.status(500).send({ message: "Terjadi kesalahan saat mengambil data pemesanan." });
        }
        res.send(results);
    });
};

// Tambahkan fungsi delete ini untuk menghapus pemesanan
exports.delete = (req, res) => {
    const bookingId = req.params.id;
    const query = "DELETE FROM services WHERE id = ?";
    
    connection.query(query, bookingId, (err, results) => {
        if (err) {
            console.error("Error deleting booking:", err);
            return res.status(500).send({ message: "Terjadi kesalahan saat menghapus pemesanan." });
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({ message: "Pemesanan tidak ditemukan." });
        }
        res.send({ message: "Pemesanan berhasil dihapus." });
    });
};

function generateTimeSlots(start, end, interval) {
    const slots = [];
    let [startHour, startMin] = start.split(':').map(Number);
    let [endHour, endMin] = end.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const time = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
        slots.push({ time, isAvailable: true });
        
        currentMin += interval;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin %= 60;
        }
    }
    return slots;
}
