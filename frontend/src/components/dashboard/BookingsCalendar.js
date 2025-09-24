import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const BookingsCalendar = ({ bookings, studios, selectedStudio, setSelectedStudio, handleDelete }) => {
    const events = bookings.map(booking => {
        const startDateTime = moment(`${booking.tanggal} ${booking.waktu_mulai}`, 'YYYY-MM-DD HH:mm').toDate();
        const endDateTime = moment(`${booking.tanggal} ${booking.waktu_selesai}`, 'YYYY-MM-DD HH:mm').toDate();

        return {
            id: booking.id,
            title: `${booking.nama} - ${booking.package_name}`,
            start: startDateTime,
            end: endDateTime,
            allDay: false
        };
    });

    return (
        <div className="p-5 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Kelola Pemesanan Studio {studios.find(s => s.id === selectedStudio)?.name}</h3>
            <div className="mb-4">
                <label htmlFor="studio-select" className="block font-medium mb-1">Pilih Studio:</label>
                <select
                    id="studio-select"
                    value={selectedStudio}
                    onChange={(e) => setSelectedStudio(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                >
                    {studios.map(studio => (
                        <option key={studio.id} value={studio.id}>{studio.name}</option>
                    ))}
                </select>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="calendar-container" style={{ height: '700px' }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView="week"
                        step={15}
                        timeslots={1}
                        min={moment('08:00', 'HH:mm').toDate()}
                        max={moment('18:00', 'HH:mm').toDate()}
                        style={{ height: 600 }}
                        onSelectEvent={(event) => {
                            handleDelete('services', event.id, 'Pemesanan berhasil dihapus!', 'Gagal menghapus pemesanan.', () => {});
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default BookingsCalendar;