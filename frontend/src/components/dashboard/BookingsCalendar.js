// src/components/dashboard/BookingsCalendar.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/id';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaMapMarkerAlt} from 'react-icons/fa';
import BookingDetailModal from './BookingDetailModal';

moment.locale('id');
const localizer = momentLocalizer(moment);

// --- KOMPONEN CUSTOM TOOLBAR ---
const CustomToolbar = ({ label, onNavigate, onView, view }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-2 rounded-lg">
            {/* Navigasi Bulan */}
            <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button onClick={() => onNavigate('PREV')} className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">
                        <FaChevronLeft />
                    </button>
                    <button onClick={() => onNavigate('TODAY')} className="px-4 text-sm font-bold text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition">
                        Hari Ini
                    </button>
                    <button onClick={() => onNavigate('NEXT')} className="p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition">
                        <FaChevronRight />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-gray-800 capitalize">{label}</h2>
            </div>

            {/* Switcher View (Bulan/Minggu/Hari/Agenda) */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {['month', 'week', 'day', 'agenda'].map((v) => (
                    <button
                        key={v}
                        onClick={() => onView(v)}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                            view === v 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {v === 'month' ? 'Bulan' : v === 'week' ? 'Minggu' : v === 'day' ? 'Hari' : 'Agenda'}
                    </button>
                ))}
            </div>
        </div>
    );
};

const BookingsCalendar = ({ 
    bookings, 
    studios, 
    selectedStudio, 
    setSelectedStudio, 
    packages, 
    showModal, 
    handleConfirmBooking, 
    handleCancelBooking, 
    handleDelete 
}) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);

    const currentStudioName = useMemo(() => {
        return studios.find(s => String(s.id) === String(selectedStudio))?.name;
    }, [studios, selectedStudio]);

    // ✅ OPTIMASI DATA & FILTER
    const events = useMemo(() => {
        if (!Array.isArray(bookings) || bookings.length === 0) return [];

        const minDate = moment().subtract(6, 'months');
        const maxDate = moment().add(1, 'year');

        return bookings
            .filter(booking => {
                if (!booking.tanggal || !booking.waktu_mulai || !booking.waktu_selesai) return false;
                const bDate = moment(booking.tanggal);
                if (!bDate.isBetween(minDate, maxDate)) return false;
                if (currentStudioName && booking.studio_name !== currentStudioName) return false; 
                return true;
            })
            .map(booking => {
                const bookingDate = moment(booking.tanggal);
                const [startHour, startMinute] = booking.waktu_mulai.split(':');
                const [endHour, endMinute] = booking.waktu_selesai.split(':');

                const start = bookingDate.clone().hour(parseInt(startHour)).minute(parseInt(startMinute)).second(0).toDate();
                const end = bookingDate.clone().hour(parseInt(endHour)).minute(parseInt(endMinute)).second(0).toDate();

                return {
                    id: booking.id,
                    title: `${booking.nama} (${booking.package_name || 'N/A'})`, // Title lebih bersih
                    start: start,
                    end: end,
                    allDay: false,
                    resource: { ...booking, package_name: booking.package_name || 'Tanpa Paket' }
                };
            });
    }, [bookings, currentStudioName]); 

    const handleSelectEvent = useCallback((event) => {
        setSelectedEvent(event.resource);
        setShowEventModal(true);
    }, []);

    const handleCloseEventModal = () => {
        setShowEventModal(false);
        setSelectedEvent(null);
    };

    // ✅ CUSTOM EVENT STYLING (Tampilan Modern)
    const eventStyleGetter = (event) => {
        const status = event.resource.status;
        let styleClass = {};

        // Style dasar
        const baseStyle = {
            borderRadius: '6px',
            border: 'none',
            borderLeft: '4px solid', // Aksen warna di kiri
            color: '#374151', // Text Gray-700
            fontSize: '0.85rem',
            fontWeight: '600',
            padding: '2px 6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        };

        if (status === 'confirmed' || status === 'finished') {
            styleClass = {
                ...baseStyle,
                backgroundColor: '#D1FAE5', // Hijau Muda (Tailwind green-100)
                borderLeftColor: '#059669', // Hijau Tua (Tailwind green-600)
                color: '#065F46' // Text Hijau Gelap
            };
        } else if (status === 'pending') {
            styleClass = {
                ...baseStyle,
                backgroundColor: '#FEF3C7', // Kuning Muda
                borderLeftColor: '#D97706', // Kuning Tua
                color: '#92400E'
            };
        } else if (status === 'canceled') {
            styleClass = {
                ...baseStyle,
                backgroundColor: '#FEE2E2', // Merah Muda
                borderLeftColor: '#DC2626', // Merah Tua
                color: '#991B1B',
                textDecoration: 'line-through',
                opacity: 0.7
            };
        } else {
            styleClass = {
                ...baseStyle,
                backgroundColor: '#E5E7EB',
                borderLeftColor: '#6B7280',
            };
        }

        return { style: styleClass };
    };

    const formats = {
        timeGutterFormat: 'HH:mm',
        eventTimeRangeFormat: ({ start, end }, culture, local) =>
            `${local.format(start, 'HH:mm', culture)} - ${local.format(end, 'HH:mm', culture)}`,
        agendaTimeRangeFormat: ({ start, end }, culture, local) =>
            `${local.format(start, 'HH:mm', culture)} - ${local.format(end, 'HH:mm', culture)}`,
        dayHeaderFormat: 'dddd, D MMMM',
    };

    return (
        <div className="flex-grow flex flex-col h-full">
            {/* --- Header Filter Studio --- */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <FaCalendarAlt size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Manajemen Jadwal</h3>
                        <p className="text-xs text-gray-500">Pantau slot booking secara real-time</p>
                    </div>
                </div>
                
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="text-gray-400" />
                    </div>
                    <select
                        value={selectedStudio}
                        onChange={(e) => setSelectedStudio(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
                    >
                        <option value="">Pilih Studio</option>
                        {studios.map(studio => (
                            <option key={studio.id} value={studio.id}>{studio.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- Kalender --- */}
            <div className="flex-grow bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-[calc(100vh-220px)] overflow-hidden">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%', fontFamily: 'inherit' }} // Pakai font global
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: CustomToolbar // Gunakan toolbar kustom kita
                    }}
                    messages={{
                        noEventsInRange: 'Tidak ada jadwal di rentang waktu ini.',
                        showMore: total => `+${total} lagi`
                    }}
                    min={moment('08:00', 'HH:mm').toDate()}
                    max={moment('19:00', 'HH:mm').toDate()}
                    step={30}
                    timeslots={2}
                    formats={formats}
                    popup
                />
            </div>

            {/* --- Modal Detail --- */}
            {showEventModal && selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
                    <BookingDetailModal
                        selectedEvent={selectedEvent}
                        onClose={handleCloseEventModal}
                        handleConfirmBooking={handleConfirmBooking}
                        handleCancelBooking={handleCancelBooking}
                        handleDelete={handleDelete}
                        showModal={showModal} 
                        packages={packages}
                    />
                </div>
            )}
        </div>
    );
};

export default BookingsCalendar;