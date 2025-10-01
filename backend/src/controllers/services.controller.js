// src/controllers/services.controller.js

const connection = require("../db.js");
const { stringify } = require("csv-stringify");
const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

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

        const bookedIntervals = bookedSlots.map((b) => ({
            start: moment.utc(`${date} ${b.waktu_mulai}`),
            end: moment.utc(`${date} ${b.waktu_selesai}`),
        }));

        const allSlots = generateTimeSlots("08:00", "17:45", 15);

        const checkAvailability = (slots) =>
            slots.map((slot) => {
                const slotTime = moment.utc(`${date} ${slot.time}`);
                const slotEnd = moment.utc(slotTime).add(15, 'minutes');

                const isBooked = bookedIntervals.some(interval => {
                    return (slotTime.isBefore(interval.end) && slotEnd.isAfter(interval.start));
                });
                
                return { time: slot.time, isAvailable: !isBooked };
            });

        const pagiSlots = checkAvailability(allSlots.filter(s => moment(s.time, 'HH:mm').isBefore(moment('12:00', 'HH:mm'))));
        const soreSlots = checkAvailability(allSlots.filter(s => moment(s.time, 'HH:mm').isSameOrAfter(moment('12:00', 'HH:mm'))));

        res.send({ pagi: pagiSlots, sore: soreSlots });
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

  if (!nama || !tanggal || !waktu_mulai || !studio_name || !package_id || isNaN(parseInt(package_id))) {
    return res.status(400).send({
      message:
        "Data pemesanan tidak lengkap atau paket belum dipilih. Pastikan package_id valid dan bukan null.",
    });
  }

  const [hour, minute] = waktu_mulai.split(":").map(Number);
  const startTime = moment().set({hour: hour, minute: minute, second: 0, millisecond: 0});
  const endTime = moment(startTime).add(15, 'minutes');

  const newBooking = {
    nama,
    email: email || null,
    nomor_whatsapp: nomor_whatsapp || null,
    catatan: catatan || null,
    tanggal,
    waktu_mulai,
    waktu_selesai: endTime.format('HH:mm'),
    jumlah_orang: jumlah_orang || 1,
    studio_name,
    package_id,
    status: 'pending' // Tambahkan status default
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
 * ✅ PERBAIKAN: Menambahkan parameter pagination
 */
exports.findAll = (req, res) => {
    const { studio_name, studioId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];
    if (studio_name) {
        whereClause = " WHERE s.studio_name = ?";
        params.push(studio_name);
    }
    
    // Query untuk menghitung total pemesanan
    const countQuery = `SELECT COUNT(*) AS total_count FROM services s ${whereClause}`;
    connection.query(countQuery, params, (err, countResult) => {
        if (err) {
            console.error("❌ Error fetching booking count:", err.sqlMessage);
            return res.status(500).send({ message: "Terjadi kesalahan saat mengambil data pemesanan.", error: err.sqlMessage });
        }
        const totalCount = countResult[0].total_count;

        // Query untuk mengambil data pemesanan dengan pagination
        let dataQuery = `SELECT s.*, p.nama_paket AS package_name, p.harga AS package_price, p.image_url AS image_url 
                         FROM services s 
                         LEFT JOIN packages p ON s.package_id = p.id
                         ${whereClause} 
                         ORDER BY s.tanggal DESC, s.waktu_mulai DESC
                         LIMIT ? OFFSET ?`;
        
        connection.query(dataQuery, [...params, parseInt(limit), parseInt(offset)], (err, results) => {
            if (err) {
                console.error("❌ Error fetching bookings:", err.sqlMessage);
                return res.status(500).send({
                    message: "Terjadi kesalahan saat mengambil data pemesanan.",
                    error: err.sqlMessage,
                });
            }
            res.send({
                data: results,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
            });
        });
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
        status
    } = req.body;

    const [hour, minute] = waktu_mulai.split(":").map(Number);
    const startTime = moment().set({hour: hour, minute: minute, second: 0, millisecond: 0});
    const endTime = moment(startTime).add(15, 'minutes');

    const updateBooking = {
        nama,
        email: email || null,
        nomor_whatsapp: nomor_whatsapp || null,
        catatan: catatan || null,
        tanggal,
        waktu_mulai,
        waktu_selesai: endTime.format('HH:mm'),
        jumlah_orang: jumlah_orang || 1,
        studio_name,
        package_id,
        status
    };

    connection.query("UPDATE services SET ? WHERE id = ?", [updateBooking, bookingId], (err, result) => {
        if (err) {
            console.error("❌ Error updating booking:", err.sqlMessage);
            return res.status(500).send({
                message: `Terjadi kesalahan saat memperbarui pemesanan: ${err.sqlMessage}`,
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Pemesanan tidak ditemukan." });
        }
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

// Fungsi baru untuk mengkonfirmasi pemesanan
exports.confirmBooking = (req, res) => {
    const bookingId = req.params.id;
    const updateStatus = { status: 'confirmed' };
    const query = "UPDATE services SET ? WHERE id = ?";

    connection.query(query, [updateStatus, bookingId], (err, result) => {
        if (err) {
            console.error("❌ Error confirming booking:", err.sqlMessage);
            return res.status(500).send({ message: `Gagal mengkonfirmasi pemesanan: ${err.sqlMessage}` });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Pemesanan tidak ditemukan." });
        }
        res.send({ message: "Pemesanan berhasil dikonfirmasi." });
    });
};

// Fungsi untuk membatalkan pemesanan
exports.cancelBooking = (req, res) => {
    const bookingId = req.params.id;
    const updateStatus = { status: 'canceled' };
    const query = "UPDATE services SET ? WHERE id = ?";

    connection.query(query, [updateStatus, bookingId], (err, result) => {
        if (err) {
            console.error("❌ Error canceling booking:", err.sqlMessage);
            return res.status(500).send({ message: `Gagal membatalkan pemesanan: ${err.sqlMessage}` });
        }
        if (result.affectedRows === 0) {
            return res.status(404).send({ message: "Pemesanan tidak ditemukan." });
        }
        res.send({ message: "Pemesanan berhasil dibatalkan." });
    });
};


/**
 * GET /services/customers
 * ✅ PERBAIKAN: Menambahkan parameter pagination dan total_count
 */
exports.findAllCustomers = (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Default: halaman 1, 10 data
    const offset = (page - 1) * limit;

    // Query untuk menghitung total pelanggan
    const countQuery = `
        SELECT COUNT(DISTINCT nomor_whatsapp) AS total_count
        FROM services;
    `;

    connection.query(countQuery, (err, countResult) => {
        if (err) {
            console.error("❌ Error fetching customer count:", err.sqlMessage);
            return res.status(500).send({ message: "Terjadi kesalahan saat mengambil data pelanggan.", error: err.sqlMessage });
        }

        const totalCount = countResult[0].total_count;

        // Query untuk mengambil data pelanggan dengan pagination
        const dataQuery = `
            SELECT 
                nama, 
                email, 
                nomor_whatsapp, 
                COUNT(*) AS total_bookings,
                MAX(tanggal) AS last_visit_date
            FROM services 
            GROUP BY nomor_whatsapp 
            ORDER BY last_visit_date DESC, total_bookings DESC
            LIMIT ? OFFSET ?;
        `;
        
        connection.query(dataQuery, [parseInt(limit), parseInt(offset)], (err, results) => {
            if (err) {
                console.error("❌ Error fetching customers:", err.sqlMessage);
                return res.status(500).send({ message: "Terjadi kesalahan saat mengambil data pelanggan.", error: err.sqlMessage });
            }
            // Mengirim data dan informasi pagination
            res.send({
                data: results,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount,
            });
        });
    });
};

exports.exportCustomers = (req, res) => {
    connection.query("SELECT nama, email, nomor_whatsapp, tanggal, waktu_mulai FROM services", (err, data) => {
        if (err) {
            return res.status(500).send({ message: err.message });
        }
        stringify(data, { header: true }, (err, output) => {
            if (err) {
                return res.status(500).send({ message: "Gagal memproses data CSV." });
            }
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
            res.status(200).send(output);
        });
    });
};

exports.importCustomers = (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "File CSV tidak diunggah." });
    }

    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    }, (err, records) => {
        if (err) {
            console.error("❌ Error parsing CSV:", err);
            fs.unlinkSync(filePath);
            return res.status(500).send({ message: "Gagal mem-parsing file CSV." });
        }

        const values = records.map(record => {
            const [tanggal, waktu_mulai] = record['Last Visit'].split(" ");
            
            return [
                record['Name'],
                record['Email'],
                record['Mobile Number'],
                tanggal,
                waktu_mulai
            ];
        });
        
        const query = "INSERT INTO services (nama, email, nomor_whatsapp, tanggal, waktu_mulai) VALUES ?";

        connection.query(query, [values], (err, result) => {
            if (err) {
                console.error("❌ Error inserting into DB:", err);
                fs.unlinkSync(filePath);
                return res.status(500).send({ message: "Gagal menyimpan data ke database. Pastikan tidak ada data duplikat atau format yang salah." });
            }
            fs.unlinkSync(filePath);
            res.send({ message: `Berhasil mengimpor ${result.affectedRows} pelanggan.` });
        });
    });
};

// Fungsi baru untuk mengambil detail pelanggan berdasarkan nomor WhatsApp
exports.getCustomerDetails = (req, res) => {
    const { nomor_whatsapp } = req.params;

    if (!nomor_whatsapp) {
        return res.status(400).send({ message: "Nomor WhatsApp diperlukan untuk mengambil detail pelanggan." });
    }

    const customerQuery = `
        SELECT 
            nama, 
            email, 
            nomor_whatsapp,
            COUNT(*) AS total_bookings,
            MAX(tanggal) AS last_visit_date
        FROM services
        WHERE nomor_whatsapp = ?
        GROUP BY nomor_whatsapp
        LIMIT 1;
    `;

    connection.query(customerQuery, [nomor_whatsapp], (err, customerResult) => {
        if (err) {
            console.error("❌ Error fetching customer details:", err.sqlMessage);
            return res.status(500).send({ message: "Gagal mengambil detail pelanggan.", error: err.sqlMessage });
        }

        if (customerResult.length === 0) {
            return res.status(404).send({ message: "Pelanggan tidak ditemukan atau tidak memiliki riwayat pemesanan." });
        }

        const customer = customerResult[0];

        const bookingsQuery = `
            SELECT 
                s.*, 
                p.nama_paket AS package_name, 
                p.harga AS package_price 
            FROM services s 
            LEFT JOIN packages p ON s.package_id = p.id
            WHERE s.nomor_whatsapp = ?
            ORDER BY s.tanggal DESC, s.waktu_mulai DESC
        `;

        connection.query(bookingsQuery, [nomor_whatsapp], (err, bookingsResults) => {
            if (err) {
                console.error("❌ Error fetching customer bookings:", err.sqlMessage);
                return res.status(500).send({ message: "Gagal mengambil riwayat pemesanan pelanggan.", error: err.sqlMessage });
            }

            const today = moment().startOf('day');
            const upcomingBookings = bookingsResults.filter(booking => moment(booking.tanggal).isSameOrAfter(today));
            const pastBookings = bookingsResults.filter(booking => moment(booking.tanggal).isBefore(today));

            const summary = {
                totalBooking: bookingsResults.length,
                totalPenjualan: bookingsResults.reduce((sum, b) => sum + (b.status === 'confirmed' ? (b.package_price || 0) : 0), 0),
                belumBayar: bookingsResults.filter(b => b.status === 'pending').length,
                komplit: bookingsResults.filter(b => b.status === 'confirmed').length,
                pembatalan: bookingsResults.filter(b => b.status === 'canceled').length,
                tidakHadir: 0,
            };

            res.send({ ...customer, summary, upcomingBookings, pastBookings });
        });
    });
};

// Fungsi baru untuk memperbarui data pelanggan
exports.updateCustomer = (req, res) => {
  const { nomor_whatsapp } = req.params;
  const { nama, email } = req.body;
  
  if (!nama || !email || !nomor_whatsapp) {
    return res.status(400).send({ message: "Data pelanggan tidak lengkap." });
  }

  const query = "UPDATE services SET nama = ?, email = ? WHERE nomor_whatsapp = ?";
  
  connection.query(query, [nama, email, nomor_whatsapp], (err, result) => {
    if (err) {
      console.error("❌ Error updating customer:", err.sqlMessage);
      return res.status(500).send({ message: `Gagal memperbarui data pelanggan: ${err.sqlMessage}` });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: "Pelanggan tidak ditemukan." });
    }
    res.send({ message: "Data pelanggan berhasil diperbarui." });
  });
};

exports.getFinancialReport = (req, res) => {
    const { month, year, studio_name } = req.query;

    let query = `
        SELECT 
            s.id,
            s.tanggal,
            s.nama,
            p.nama_paket AS package_name,
            p.harga AS package_price,
            s.studio_name
        FROM services s
        LEFT JOIN packages p ON s.package_id = p.id
        WHERE s.status = 'confirmed'
    `;

    const params = [];

    if (year && month) {
        query += ` AND YEAR(s.tanggal) = ? AND MONTH(s.tanggal) = ?`;
        params.push(year, month);
    } else if (year) {
        query += ` AND YEAR(s.tanggal) = ?`;
        params.push(year);
    } else if (month) {
        query += ` AND MONTH(s.tanggal) = ?`;
        params.push(month);
    }
    // ✅ TAMBAHAN: Filter berdasarkan studio
    if (studio_name) {
        query += ` AND s.studio_name = ?`;
        params.push(studio_name);
    }

    query += ` ORDER BY s.tanggal DESC`;

    connection.query(query, params, (err, results) => {
        if (err) {
            console.error("❌ Error fetching financial report:", err.sqlMessage);
            return res.status(500).send({
                message: "Terjadi kesalahan saat mengambil laporan keuangan.",
                error: err.sqlMessage,
            });
        }
        res.send(results);
    });
};