import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
// ✅ Import locale Indonesia
import 'moment/locale/id';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import BookingDetailModal from './BookingDetailModal';

// ✅ Atur moment agar menggunakan locale Indonesia
moment.locale('id');
const localizer = momentLocalizer(moment);

const BookingsCalendar = ({ bookings, studios, selectedStudio, setSelectedStudio, packages, showModal, handleConfirmBooking }) => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);

    useEffect(() => {
        if (!bookings || bookings.length === 0) {
            setEvents([]);
            return;
        }

        const calendarEvents = bookings.map(booking => {
            const start = moment(`${booking.tanggal} ${booking.waktu_mulai}`, 'YYYY-MM-DD HH:mm').toDate();
            const end = moment(`${booking.tanggal} ${booking.waktu_selesai}`, 'YYYY-MM-DD HH:mm').toDate();

            const pkgName = booking.package_name || 'Tanpa Paket';
            let title = `${booking.nama} - ${pkgName}`;

            if (booking.status === 'confirmed') {
                title = `✅ ${title}`;
            } else if (booking.status === 'pending') {
                title = `⏳ ${title}`;
            } else if (booking.status === 'canceled') {
                title = `❌ ${title}`;
            }

            return {
                id: booking.id,
                title: title,
                start: start,
                end: end,
                allDay: false,
                resource: {
                    ...booking,
                    package_name: pkgName
                }
            };
        });
        setEvents(calendarEvents);
    }, [bookings]);

    const handleSelectEvent = useCallback((event) => {
        setSelectedEvent(event.resource);
        setShowEventModal(true);
    }, []);

    const handleCloseEventModal = () => {
        setShowEventModal(false);
        setSelectedEvent(null);
    };

    const eventStyleGetter = (event) => {
        let backgroundColor = '#3174ad';
        if (event.resource.status === 'confirmed') {
            backgroundColor = '#4CAF50';
        } else if (event.resource.status === 'pending') {
            backgroundColor = '#FFC107';
        } else if (event.resource.status === 'canceled') {
            backgroundColor = '#F44336';
        }

        const style = {
            backgroundColor: backgroundColor,
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block',
        };
        return {
            style: style
        };
    };

    const currentStudioName = studios.find(s => s.id === selectedStudio)?.name || 'Pilih Studio';
    
    // ✅ PROPERTI BARU UNTUK MENGATUR FORMAT WAKTU
    const formats = {
        timeGutterFormat: 'HH:mm', // Format 24 jam untuk sumbu waktu
        agendaTimeFormat: 'HH:mm', // Format 24 jam untuk tampilan agenda
        dayFormat: 'dddd, MMMM D', // Format tanggal hari
        weekdayFormat: 'dddd',      // Format nama hari
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Jadwal Pemesanan ({currentStudioName})</h3>
                <div className="relative">
                    <select
                        value={selectedStudio}
                        onChange={(e) => setSelectedStudio(e.target.value)}
                        className="bg-white border rounded-lg p-2 text-sm"
                    >
                        <option value="">Pilih Studio</option>
                        {studios.map(studio => (
                            <option key={studio.id} value={studio.id}>{studio.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex-grow bg-white rounded-lg shadow-sm p-4 h-[calc(100vh-200px)]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    messages={{
                        today: 'Hari Ini',
                        previous: 'Sebelumnya',
                        next: 'Berikutnya',
                        month: 'Bulan',
                        week: 'Minggu',
                        day: 'Hari',
                        agenda: 'Agenda',
                        date: 'Tanggal',
                        time: 'Waktu',
                        event: 'Acara'
                    }}
                    min={moment('08:00', 'HH:mm').toDate()}
                    max={moment('18:00', 'HH:mm').toDate()}
                    step={15}
                    timeslots={4}
                    formats={formats}
                />
            </div>
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
                    <BookingDetailModal
                        selectedEvent={selectedEvent}
                        onClose={handleCloseEventModal}
                        handleConfirmBooking={handleConfirmBooking}
                        showModal={showModal} 
                    />
                </div>
            )}
        </div>
    );
};

export default BookingsCalendar;