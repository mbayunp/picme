// src/components/dashboard/ContactMessages.jsx
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { FaCheck, FaUndo } from 'react-icons/fa'; // Ikon untuk aksi

const ContactMessages = ({ messages, fetchMessages, showModal }) => {
    // State lokal untuk menyimpan ID pesan yang sudah "selesai"
    // Idealnya ini disimpan di database (backend)
    const [completedMessages, setCompletedMessages] = useState([]);

    useEffect(() => {
        fetchMessages();
        
        // (Opsional) Load status selesai dari LocalStorage agar tidak hilang saat refresh
        const savedCompleted = JSON.parse(localStorage.getItem('completedMessages') || '[]');
        setCompletedMessages(savedCompleted);
    }, [fetchMessages]);

    const formatShortDate = (dateString) => {
        return moment(dateString).format('DD MMM YYYY, HH:mm');
    };

    const toggleComplete = (id) => {
        let updatedCompleted;
        if (completedMessages.includes(id)) {
            // Jika sudah selesai, batalkan (un-complete)
            updatedCompleted = completedMessages.filter(msgId => msgId !== id);
        } else {
            // Jika belum, tandai selesai
            updatedCompleted = [...completedMessages, id];
        }
        setCompletedMessages(updatedCompleted);
        // Simpan ke LocalStorage
        localStorage.setItem('completedMessages', JSON.stringify(updatedCompleted));
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
            <h3 className="text-xl font-bold mb-4">Pesan Masuk</h3>
            <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nama
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pesan
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {messages.length > 0 ? (
                            messages.map((msg) => {
                                const isCompleted = completedMessages.includes(msg.id);
                                return (
                                    <tr 
                                        key={msg.id} 
                                        className={`transition-colors duration-200 ${isCompleted ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => toggleComplete(msg.id)}
                                                className={`p-2 rounded-full transition-colors ${
                                                    isCompleted 
                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                                title={isCompleted ? "Tandai Belum Selesai" : "Tandai Selesai"}
                                            >
                                                {isCompleted ? <FaUndo size={12} /> : <FaCheck size={12} />}
                                            </button>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                            {formatShortDate(msg.created_at)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                            {msg.name}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                            {msg.email}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-normal text-sm max-w-lg ${isCompleted ? 'text-gray-400 line-through italic' : 'text-gray-500'}`}>
                                            {msg.message}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                    Tidak ada pesan masuk.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContactMessages;