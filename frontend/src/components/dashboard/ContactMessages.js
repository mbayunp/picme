// src/components/dashboard/ContactMessages.jsx
import React, { useEffect } from 'react';
import moment from 'moment';

const ContactMessages = ({ messages, fetchMessages, showModal }) => {
    
    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const formatShortDate = (dateString) => {
        return moment(dateString).format('DD MMM YYYY, HH:mm');
    };

    return (
        <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
            <h3 className="text-xl font-bold mb-4">Pesan Masuk</h3>
            <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
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
                            messages.map((msg) => (
                                <tr key={msg.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatShortDate(msg.created_at)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{msg.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{msg.email}</td>
                                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-lg truncate">{msg.message}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
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