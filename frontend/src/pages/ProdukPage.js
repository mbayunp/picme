// src/pages/ProdukPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProdukPage.css';

function ProdukPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Fungsi untuk mengambil data produk dari backend
    const fetchProducts = async () => {
      try {
    const response = await axios.get('http://localhost:8080/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    
    fetchProducts();
  }, []);

  return (
    <div className="produk-page">
      <h1>Daftar Produk Kami</h1>
      <div className="produk-list">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="produk-card">
              <img src={product.url_foto} alt={product.nama_produk} />
              <h3>{product.nama_produk}</h3>
              <p>Rp {product.harga}</p>
              <p>{product.deskripsi}</p>
            </div>
          ))
        ) : (
          <p>Belum ada produk yang tersedia.</p>
        )}
      </div>
    </div>
  );
}

export default ProdukPage;