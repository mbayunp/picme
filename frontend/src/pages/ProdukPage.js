import React, { useState, useEffect } from "react";
import axios from "axios";

// ✅ PERBAIKAN: Tambahkan variabel lingkungan untuk URL API
const API_URL = process.env.REACT_APP_API_URL;

function ProdukPage() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // ✅ PERBAIKAN: Menggunakan variabel lingkungan
                const response = await axios.get(`${API_URL}/api/products`);
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="px-6 py-10 text-center min-h-screen pt-32">
            <h1 className="mb-8 text-4xl font-bold">Daftar Produk Kami</h1>
            <div className="flex flex-wrap justify-center gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div
                            key={product.id}
                            className="w-72 rounded-lg border border-gray-200 shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                        >
                            <img
                                src={product.url_foto}
                                alt={product.nama_produk}
                                className="h-52 w-full object-cover"
                            />
                            <div className="p-4">
                                <h3 className="mb-2 text-xl font-semibold">
                                    {product.nama_produk}
                                </h3>
                                <p className="mb-2 text-lg font-medium text-gray-700">
                                    Rp {product.harga}
                                </p>
                                <p className="text-sm text-gray-600">{product.deskripsi}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">Belum ada produk yang tersedia.</p>
                )}
            </div>
        </div>
    );
}

export default ProdukPage;