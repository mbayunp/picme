import React from 'react';

const Modal = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl w-80">
                <h4 className="text-lg font-bold mb-4">{title}</h4>
                <p className="mb-4">{message}</p>
                <div className="flex justify-end gap-2">
                    {onCancel && (
                        <button onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400">
                            Batal
                        </button>
                    )}
                    {onConfirm && (
                        <button onClick={onConfirm} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            OK
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;