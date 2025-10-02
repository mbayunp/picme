import React, { useState, useEffect } from 'react';
import moment from 'moment';


const MergeModal = ({ onClose, customerToMerge, duplicateRecords, mergeCustomer }) => {
    const [masterRecordId, setMasterRecordId] = useState(null);

    useEffect(() => {
        if (duplicateRecords && duplicateRecords.length > 0) {
            // Atur master record secara default ke entri yang paling baru
            setMasterRecordId(duplicateRecords[0].id);
        }
    }, [duplicateRecords]);

    if (!customerToMerge || !duplicateRecords) return null;

    const handleMerge = () => {
        if (!masterRecordId) {
            alert('Pilih master record untuk melanjutkan.');
            return;
        }

        const duplicateIds = duplicateRecords
            .filter(record => record.id !== masterRecordId)
            .map(record => record.id);

        if (duplicateIds.length === 0) {
            alert('Tidak ada record duplikat yang tersisa untuk digabungkan.');
            return;
        }

        mergeCustomer(masterRecordId, duplicateIds);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
                <h4 className="text-xl font-bold mb-4">Gabungkan Data Pelanggan</h4>
                <p className="text-gray-700 mb-4">
                    Nomor Telepon: <span className="font-mono">{customerToMerge.nomor_whatsapp}</span>
                </p>

                <div className="space-y-4">
                    {/* Daftar semua duplikat */}
                    {duplicateRecords.map(record => (
                        <div
                            key={record.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                                record.id === masterRecordId ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => setMasterRecordId(record.id)}
                        >
                            <div className="flex items-center">
                                <input
                                    type="radio"
                                    name="masterRecord"
                                    checked={record.id === masterRecordId}
                                    onChange={() => setMasterRecordId(record.id)}
                                    className="mr-2"
                                />
                                <label className="flex-1">
                                    <p className="font-semibold">{record.nama}</p>
                                    <p className="text-sm text-gray-500">{record.email}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Tanggal: {moment(record.tanggal).format('DD/MM/YYYY')} | ID: {record.id}
                                    </p>
                                </label>
                                {record.id === masterRecordId && (
                                    <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                                        Master
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleMerge} 
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Gabungkan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MergeModal;