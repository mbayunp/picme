// src/utils/getImageUrl.js

const BASE_URL = process.env.REACT_APP_BASE_URL;
const PLACEHOLDER_URL = 'https://placehold.co/800x600/D1D5DB/1F2937?text=Gambar+Tidak+Tersedia';

/**
 * Fungsi untuk membangun URL gambar yang benar.
 * @param {string} path - Path gambar dari API (contoh: 'assets/images/namafile.jpg').
 * @returns {string} URL gambar yang lengkap dan valid.
 */
export const getImageUrl = (path) => {
  // Jika path tidak valid, kembalikan placeholder
  if (!path || typeof path !== 'string') {
    return PLACEHOLDER_URL;
  }
  
  // Jika path sudah merupakan URL lengkap (misal: dari YouTube), langsung kembalikan
  if (path.startsWith('http')) {
    return path;
  }

  // Hapus garis miring di awal path untuk menghindari URL ganda (//)
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Gabungkan URL dasar dengan path yang bersih
  return `${BASE_URL}/${cleanPath}`;
};