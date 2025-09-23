const connection = require("../db.js");

// Helper: generate slot waktu
function generateTimeSlots(start, end, interval) {
    const slots = [];
    let [startHour, startMin] = start.split(":").map(Number);
    let [endHour, endMin] = end.split(":").map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
        const time = `${currentHour.toString().padStart(2, "0")}:${currentMin
            .toString()
            .padStart(2, "0")}`;
        slots.push({ time, isAvailable: true });

        currentMin += interval;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin %= 60;
        }
    }
    return slots;
}

/**
 * GET /services/slots
 * Menghasilkan slot Pagi & Sore sesuai kebutuhan
 */
exports.getAvailableSlots = (req, res) => {
    const { date, studio } = req.query;

    if (!date || !studio) {
        return res.status(400).send({ message: "Tanggal dan studio diperlukan untuk mencari slot." });
    }

    const query =
        "SELECT waktu_mulai, waktu_selesai FROM services WHERE tanggal = ? AND studio_name = ?";
    connection.query(query, [date, studio], (err, bookedSlots) => {
        if (err) {
            console.error("❌ Error fetching booked slots:", err.sqlMessage);
            return res.status(500).send({
                message: "Terjadi kesalahan saat mengambil data jadwal.",
                error: err.sqlMessage,
            });
        }

        // slot pagi & sore sesuai gambar
        const pagiSlots = generateTimeSlots("08:00", "11:45", 15);
        const soreSlots = generateTimeSlots("12:00", "17:45", 15);

        const bookedIntervals = bookedSlots.map((b) => ({
            start: new Date(`1970-01-01T${b.waktu_mulai}`),
            end: new Date(`1970-01-01T${b.waktu_selesai}`),
        }));

        const checkAvailability = (slots) =>
            slots.map((slot) => {
                const slotTime = new Date(`1970-01-01T${slot.time}`);
                const isBooked = bookedIntervals.some(
                    (interval) => slotTime >= interval.start && slotTime < interval.end
                );
                return { time: slot.time, isAvailable: !isBooked };
            });

        res.send({
            pagi: checkAvailability(pagiSlots),
            sore: checkAvailability(soreSlots),
        });
    });
};

/**
 * POST /services
 */
exports.create = (req, res) => {
    const {
        nama,
        email,
        nomor_whatsapp,
        catatan,
        tanggal,
        waktu_mulai,
        jumlah_orang,
        studio_name,
        package_id,
    } = req.body;

    console.log("Menerima permintaan POST untuk pemesanan dengan data:", req.body);

    if (!nama || !tanggal || !waktu_mulai || !studio_name || !package_id || isNaN(parseInt(package_id))) {
        return res.status(400).send({
            message:
                "Data pemesanan tidak lengkap atau paket belum dipilih. Pastikan package_id valid dan bukan null.",
        });
    }

    // hitung waktu_selesai
    const [hour, minute] = waktu_mulai.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(hour, minute, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 15);

    const waktu_selesai = `${endTime.getHours().toString().padStart(2, "0")}:${endTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

    const newBooking = {
        nama,
        email: email || null,
        nomor_whatsapp: nomor_whatsapp || null,
        catatan: catatan || null,
        tanggal,
        waktu_mulai,
        waktu_selesai,
        jumlah_orang: jumlah_orang || 1,
        studio_name,
        package_id,
    };

    connection.query("INSERT INTO services SET ?", newBooking, (err, data) => {
        if (err) {
            console.error("❌ Error creating booking:", err.sqlMessage);
            return res.status(500).send({
                message: `Terjadi kesalahan saat menyimpan pemesanan: ${err.sqlMessage}`,
                error: err.sqlMessage,
            });
        }
        res.status(201).send({ id: data.insertId, ...newBooking, message: "Pemesanan berhasil dibuat!" });
    });
};

/**
 * GET /services
 */
exports.findAll = (req, res) => {
    const { studio_name, studioId } = req.query;

    let query = `
        SELECT 
            s.*, 
            p.nama_paket AS package_name 
        FROM services s 
        LEFT JOIN packages p ON s.package_id = p.id
    `;
    let params = [];

    // Gunakan hanya studio_name untuk menghindari kebingungan
    if (studio_name) {
        query += " WHERE s.studio_name = ?";
        params.push(studio_name);
    }
    
    query += " ORDER BY s.tanggal DESC, s.waktu_mulai DESC";

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("❌ Error fetching bookings:", err.sqlMessage);
            return res.status(500).send({
                message: "Terjadi kesalahan saat mengambil data pemesanan.",
                error: err.sqlMessage,
            });
        }
        res.send(results);
    });
};

/**
 * PUT /services/:id
 */
exports.update = (req, res) => {
    const bookingId = req.params.id;
    const {
        nama,
        email,
        nomor_whatsapp,
        catatan,
        tanggal,
        waktu_mulai,
        jumlah_orang,
        studio_name,
        package_id,
    } = req.body;

    const [hour, minute] = waktu_mulai.split(":").map(Number);
    const startTime = new Date();
    startTime.setHours(hour, minute, 0, 0);

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 15);

    const waktu_selesai = `${endTime.getHours().toString().padStart(2, "0")}:${endTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

    const updateBooking = {
        nama,
        email: email || null,
        nomor_whatsapp: nomor_whatsapp || null,
        catatan: catatan || null,
        tanggal,
        waktu_mulai,
        waktu_selesai,
        jumlah_orang: jumlah_orang || 1,
        studio_name,
        package_id,
    };

    connection.query("UPDATE services SET ? WHERE id = ?", [updateBooking, bookingId], (err, result) => {
        if (err) {
            console.error("❌ Error updating booking:", err.sqlMessage);
            return res.status(500).send({
                message: `Terjadi kesalahan saat memperbarui pemesanan: ${err.sqlMessage}`,
                error: err.sqlMessage,
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Pemesanan tidak ditemukan." });
        }
        // Ambil record terbaru supaya frontend langsung sinkron
        connection.query("SELECT * FROM services WHERE id = ?", [bookingId], (err2, rows) => {
            if (err2) {
                return res.status(500).send({ message: "Update berhasil tapi gagal ambil data baru." });
            }
            res.send({ ...rows[0], message: "Pemesanan berhasil diperbarui!" });
        });
    });
};

/**
 * DELETE /services/:id
 */
exports.delete = (req, res) => {
    const bookingId = req.params.id;
    const query = "DELETE FROM services WHERE id = ?";

    connection.query(query, [bookingId], (err, results) => {
        if (err) {
            console.error("❌ Error deleting booking:", err.sqlMessage);
            return res.status(500).send({
                message: "Terjadi kesalahan saat menghapus pemesanan.",
                error: err.sqlMessage,
            });
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({ message: "Pemesanan tidak ditemukan." });
        }
        res.send({ message: "Pemesanan berhasil dihapus." });
    });
};

/**
 * GET /services/customers
 * Mengambil daftar pelanggan unik dengan jumlah pemesanan dan kunjungan terakhir.
 */
exports.findAllCustomers = (req, res) => {
    const query = `
        SELECT 
            nama, 
            email, 
            nomor_whatsapp, 
            COUNT(*) AS total_bookings,
            MAX(tanggal) AS last_visit_date
        FROM services 
        GROUP BY nama, email, nomor_whatsapp 
        ORDER BY last_visit_date DESC, total_bookings DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching customers:", err.sqlMessage);
            return res.status(500).send({ message: "Terjadi kesalahan saat mengambil data pelanggan.", error: err.sqlMessage });
        }
        res.send(results);
    });
};
