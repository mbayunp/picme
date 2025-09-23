import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings-data');
    const [selectedStudio, setSelectedStudio] = useState('1');
    const [posts, setPosts] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [packages, setPackages] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [newPackage, setNewPackage] = useState({ nama_paket: '', harga: '', deskripsi_paket: '' });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [currentPackageId, setCurrentPackageId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalAction, setModalAction] = useState(null);
    const [isEditingBooking, setIsEditingBooking] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);
    const [bookingForm, setBookingForm] = useState({
        nama: '',
        email: '',
        nomor_whatsapp: '',
        catatan: '',
        tanggal: '',
        waktu_mulai: '',
        waktu_selesai: '',
        package_id: null,
        studio_name: '',
        jumlah_orang: 1
    });
    const [isEditingCustomer, setIsEditingCustomer] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [customerForm, setCustomerForm] = useState({
        nama: '',
        email: '',
        nomor_whatsapp: '',
    });

    const [sortKey, setSortKey] = useState('tanggal');
    const [sortDirection, setSortDirection] = useState('desc');

    const studios = [
        { id: '1', name: 'Picme Photo Studio 1' },
        { id: '2', name: 'Picme Photo Studio 2' },
        { id: '3', name: 'Picme Photo Studio 3' },
        { id: '4', name: 'Picme Photo Studio 4' },
    ];

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            const response = await axios.get('http://localhost:8080/api/posts', config);
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('admin-token');
            const studioName = studios.find(s => s.id === selectedStudio)?.name;
            if (!studioName) {
                setBookings([]);
                return;
            }

            const config = { 
                headers: { 'x-access-token': token }, 
                params: { studio_name: studioName }
            };
            const response = await axios.get('http://localhost:8080/api/services', config);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };
    
    const fetchAllBookings = async () => {
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            const response = await axios.get('http://localhost:8080/api/services', config);
            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching all bookings:', error);
        }
    };

    const fetchPackages = async () => {
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            const response = await axios.get('http://localhost:8080/api/packages', config);
            setPackages(response.data);
        } catch (error) {
            console.error('Error fetching packages:', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            const response = await axios.get('http://localhost:8080/api/services/customers', config);
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('admin-token');
        if (!token) {
            navigate('/admin/login');
        } else {
            axios.defaults.headers.common['x-access-token'] = token;
            if (activeTab === 'posts') {
                fetchPosts();
            } else if (activeTab === 'bookings') {
                fetchBookings();
            } else if (activeTab === 'bookings-data') {
                fetchAllBookings();
                fetchPackages();
            } else if (activeTab === 'customers') {
                fetchCustomers();
            } else if (activeTab === 'packages') {
                fetchPackages();
            }
        }
    }, [activeTab, navigate, selectedStudio]);

    const handleInputChange = (e) => {
        setNewPost({ ...newPost, [e.target.name]: e.target.value });
    };

    const handlePackageInputChange = (e) => {
        setNewPackage({ ...newPackage, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl('');
        }
    };

    const handleAddPost = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const config = {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data',
                }
            };
            const formData = new FormData();
            formData.append('title', newPost.title);
            formData.append('content', newPost.content);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            await axios.post('http://localhost:8080/api/posts', formData, config);
            setModalTitle('Berhasil');
            setModalMessage('Postingan berhasil ditambahkan!');
            setShowModal(true);
            setNewPost({ title: '', content: '' });
            setImageFile(null);
            setPreviewUrl('');
            fetchPosts();
        } catch (error) {
            console.error('Error adding post:', error);
            setModalTitle('Gagal');
            setModalMessage('Gagal menambahkan postingan.');
            setShowModal(true);
        }
    };

    const handleAddPackage = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const formData = new FormData();
            formData.append('nama_paket', newPackage.nama_paket);
            formData.append('harga', newPackage.harga);
            formData.append('deskripsi_paket', newPackage.deskripsi_paket);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const config = {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data',
                },
            };
            await axios.post('http://localhost:8080/api/packages', formData, config);
            setModalTitle('Berhasil');
            setModalMessage('Paket berhasil ditambahkan!');
            setShowModal(true);
            setNewPackage({ nama_paket: '', harga: '', deskripsi_paket: '' });
            setImageFile(null);
            setPreviewUrl('');
            fetchPackages();
        } catch (error) {
            console.error('Error adding package:', error);
            setModalTitle('Gagal');
            setModalMessage('Gagal menambahkan paket.');
            setShowModal(true);
        }
    };

    const handleEditClick = (post) => {
        setIsEditing(true);
        setCurrentPostId(post.id);
        setNewPost({ title: post.title, content: post.content });
        setPreviewUrl(`http://localhost:8080/assets/images/${post.image_url}`);
    };

    const handleEditPackageClick = (pkg) => {
        setIsEditing(true);
        setCurrentPackageId(pkg.id);
        setNewPackage({ nama_paket: pkg.nama_paket, harga: pkg.harga, deskripsi_paket: pkg.deskripsi_paket });
        setPreviewUrl(`http://localhost:8080/assets/images/${pkg.image_url}`);
    };

    const handleEditBookingClick = async (booking) => {
        if (packages.length === 0) {
            await fetchPackages();
        }
        setCurrentBooking(booking);
        setBookingForm({
            nama: booking.nama || '',
            email: booking.email || '',
            nomor_whatsapp: booking.nomor_whatsapp || '',
            catatan: booking.catatan || '',
            tanggal: booking.tanggal.split('T')[0] || '',
            waktu_mulai: booking.waktu_mulai || '',
            waktu_selesai: booking.waktu_selesai || '',
            package_id: booking.package_id != null ? booking.package_id.toString() : '',
            studio_name: booking.studio_name || '',
            jumlah_orang: booking.jumlah_orang != null ? booking.jumlah_orang : 1
        });
        setIsEditingBooking(true);
    };

    const handleBookingFormChange = (e) => {
        const { name, value } = e.target;
        setBookingForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditCustomerClick = (customer) => {
        setCurrentCustomer(customer);
        setCustomerForm({
            nama: customer.nama,
            email: customer.email,
            nomor_whatsapp: customer.nomor_whatsapp,
        });
        setIsEditingCustomer(true);
    };

    const handleCustomerFormChange = (e) => {
        const { name, value } = e.target;
        setCustomerForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdatePost = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const config = {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data',
                }
            };
            const formData = new FormData();
            formData.append('title', newPost.title);
            formData.append('content', newPost.content);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            await axios.put(`http://localhost:8080/api/posts/${currentPostId}`, formData, config);
            setModalTitle('Berhasil');
            setModalMessage('Postingan berhasil diperbarui!');
            setShowModal(true);
            setIsEditing(false);
            setCurrentPostId(null);
            setNewPost({ title: '', content: '' });
            setImageFile(null);
            setPreviewUrl('');
            fetchPosts();
        } catch (error) {
            console.error('Error updating post:', error);
            setModalTitle('Gagal');
            setModalMessage('Gagal memperbarui postingan.');
            setShowModal(true);
        }
    };

    const handleUpdatePackage = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const formData = new FormData();
            formData.append('nama_paket', newPackage.nama_paket);
            formData.append('harga', newPackage.harga);
            formData.append('deskripsi_paket', newPackage.deskripsi_paket);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const config = {
                headers: {
                    'x-access-token': token,
                    'Content-Type': 'multipart/form-data',
                },
            };
            await axios.put(`http://localhost:8080/api/packages/${currentPackageId}`, formData, config);
            setModalTitle('Berhasil');
            setModalMessage('Paket berhasil diperbarui!');
            setShowModal(true);
            setIsEditing(false);
            setCurrentPackageId(null);
            setNewPackage({ nama_paket: '', harga: '', deskripsi_paket: '' });
            setImageFile(null);
            setPreviewUrl('');
            fetchPackages();
        } catch (error) {
            console.error('Error updating package:', error);
            setModalTitle('Gagal');
            setModalMessage('Gagal memperbarui paket.');
            setShowModal(true);
        }
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            const payload = {
                nama: bookingForm.nama,
                email: bookingForm.email,
                nomor_whatsapp: bookingForm.nomor_whatsapp,
                catatan: bookingForm.catatan,
                tanggal: bookingForm.tanggal,
                waktu_mulai: bookingForm.waktu_mulai,
                waktu_selesai: bookingForm.waktu_selesai,
                package_id: bookingForm.package_id ? parseInt(bookingForm.package_id, 10) : null,
                studio_name: bookingForm.studio_name,
                jumlah_orang: parseInt(bookingForm.jumlah_orang, 10) || 1
            };
            await axios.put(`http://localhost:8080/api/services/${currentBooking.id}`, payload, config);
            setModalTitle('Berhasil');
            setModalMessage('Pemesanan berhasil diperbarui!');
            setShowModal(true);
            setIsEditingBooking(false);
            setCurrentBooking(null);
            if (activeTab === 'bookings') {
                fetchBookings();
            } else if (activeTab === 'bookings-data') {
                fetchAllBookings();
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            setModalTitle('Gagal');
            setModalMessage('Gagal memperbarui pemesanan.');
            setShowModal(true);
        }
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('admin-token');
            const config = { headers: { 'x-access-token': token } };
            const payload = {
                nama: customerForm.nama,
                email: customerForm.email,
                nomor_whatsapp: customerForm.nomor_whatsapp,
            };
            await axios.put(`http://localhost:8080/api/services/customer/${currentCustomer.nomor_whatsapp}`, payload, config);
            setModalTitle('Berhasil');
            setModalMessage('Data pelanggan berhasil diperbarui!');
            setShowModal(true);
            setIsEditingCustomer(false);
            setCurrentCustomer(null);
            fetchCustomers();
        } catch (error) {
            console.error('Error updating customer:', error);
            setModalTitle('Gagal');
            setModalMessage('Gagal memperbarui data pelanggan.');
            setShowModal(true);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setCurrentPostId(null);
        setCurrentPackageId(null);
        setNewPost({ title: '', content: '' });
        setNewPackage({ nama_paket: '', harga: '', deskripsi_paket: '' });
        setImageFile(null);
        setPreviewUrl('');
        setIsEditingBooking(false);
        setIsEditingCustomer(false);
    };

    const handleDeletePost = async (postId) => {
        setModalTitle('Konfirmasi');
        setModalMessage('Apakah Anda yakin ingin menghapus postingan ini?');
        setModalAction(() => async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                await axios.delete(`http://localhost:8080/api/posts/${postId}`, config);
                setModalTitle('Berhasil');
                setModalMessage('Postingan berhasil dihapus!');
                setShowModal(true);
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
                setModalTitle('Gagal');
                setModalMessage('Gagal menghapus postingan.');
                setShowModal(true);
            }
        });
        setShowModal(true);
    };

    const handleDeletePackage = async (packageId) => {
        setModalTitle('Konfirmasi');
        setModalMessage('Apakah Anda yakin ingin menghapus paket ini?');
        setModalAction(() => async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                await axios.delete(`http://localhost:8080/api/packages/${packageId}`, config);
                setModalTitle('Berhasil');
                setModalMessage('Paket berhasil dihapus!');
                setShowModal(true);
                fetchPackages();
            } catch (error) {
                console.error('Error deleting package:', error);
                setModalTitle('Gagal');
                setModalMessage('Gagal menghapus paket.');
                setShowModal(true);
            }
        });
        setShowModal(true);
    };

    const handleDeleteBooking = async (bookingId) => {
        setModalTitle('Konfirmasi');
        setModalMessage('Apakah Anda yakin ingin menghapus pemesanan ini?');
        setModalAction(() => async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const config = { headers: { 'x-access-token': token } };
                await axios.delete(`http://localhost:8080/api/services/${bookingId}`, config);
                setModalTitle('Berhasil');
                setModalMessage('Pemesanan berhasil dihapus!');
                setShowModal(true);
                if (activeTab === 'bookings') {
                    fetchBookings();
                } else if (activeTab === 'bookings-data') {
                    fetchAllBookings();
                }
            } catch (error) {
                console.error('Error deleting booking:', error);
                setModalTitle('Gagal');
                setModalMessage('Gagal menghapus pemesanan.');
                setShowModal(true);
            }
        });
        setShowModal(true);
    };

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
    
    const sortedBookings = [...bookings].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;
        
        let comparison = 0;
        if (sortKey === 'tanggal') {
            comparison = moment(aValue).diff(moment(bValue));
        } else {
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const renderSortArrow = (key) => {
        if (sortKey === key) {
            return sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
        return null;
    };

    const sortedCustomers = [...customers].sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (aValue === bValue) return 0;
        
        let comparison = 0;
        if (sortKey === 'last_visit_date') {
            comparison = moment(aValue).diff(moment(bValue));
        } else {
            if (aValue > bValue) comparison = 1;
            if (aValue < bValue) comparison = -1;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
    });

    const formatShortDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getPackageName = (packageId) => {
        const pkg = packages.find(p => p.id === packageId);
        return pkg ? pkg.nama_paket : 'Tanpa Paket';
    };

    const formatLastVisitDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <div className="p-5 bg-gray-100 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">Kelola Postingan</h3>
                        <form onSubmit={isEditing ? handleUpdatePost : handleAddPost} className="flex flex-col gap-4 mb-8">
                            <input
                                type="text"
                                name="title"
                                placeholder="Judul Postingan"
                                value={newPost.title}
                                onChange={handleInputChange}
                                required
                                className="p-2 border border-gray-300 rounded-md"
                            />
                            <textarea
                                name="content"
                                placeholder="Isi Postingan"
                                value={newPost.content}
                                onChange={handleInputChange}
                                required
                                className="p-2 border border-gray-300 rounded-md"
                            />
                            <input
                                type="file"
                                name="image"
                                onChange={handleImageChange}
                                className="p-2 border border-gray-300 rounded-md"
                            />
                            {previewUrl && (
                                <div className="w-36 h-36 border border-gray-300 rounded-lg overflow-hidden">
                                    <img src={previewUrl} alt="Pratinjau Gambar" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button type="submit" className="bg-green-600 text-white p-2 rounded-md cursor-pointer hover:bg-green-700 transition">
                                    {isEditing ? 'Perbarui Postingan' : 'Tambah Postingan'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={handleCancelEdit} className="bg-red-600 text-white p-2 rounded-md cursor-pointer hover:bg-red-700 transition">
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                        <div className="flex flex-col gap-4">
                            {posts.map(post => (
                                <div key={post.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                                    {post.image_url && (
                                        <img
                                            src={`http://localhost:8080/assets/images/${post.image_url}`}
                                            alt={post.title}
                                            className="w-24 h-24 object-cover rounded-md mr-4"
                                        />
                                    )}
                                    <div className="flex-grow">
                                        <h4 className="font-semibold">{post.title}</h4>
                                        <p className="text-sm text-gray-500">{post.content.substring(0, 100)}...</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditClick(post)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition">Edit</button>
                                        <button onClick={() => handleDeletePost(post.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'packages':
                return (
                    <div className="p-5 bg-gray-100 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">Kelola Paket</h3>
                        <form onSubmit={isEditing ? handleUpdatePackage : handleAddPackage} className="flex flex-col gap-4 mb-8">
                            <input
                                type="text"
                                name="nama_paket"
                                placeholder="Nama Paket"
                                value={newPackage.nama_paket}
                                onChange={handlePackageInputChange}
                                required
                                className="p-2 border border-gray-300 rounded-md"
                            />
                            <input
                                type="number"
                                name="harga"
                                placeholder="Harga"
                                value={newPackage.harga}
                                onChange={handlePackageInputChange}
                                required
                                className="p-2 border border-gray-300 rounded-md"
                            />
                            <textarea
                                name="deskripsi_paket"
                                placeholder="Deskripsi Paket"
                                value={newPackage.deskripsi_paket}
                                onChange={handlePackageInputChange}
                                required
                                className="p-2 border border-gray-300 rounded-md"
                            />
                            <input
                                type="file"
                                name="image"
                                onChange={handleImageChange}
                                className="p-2 border border-gray-300 rounded-md"
                            />
                            {previewUrl && (
                                <div className="w-36 h-36 border border-gray-300 rounded-lg overflow-hidden">
                                    <img src={previewUrl} alt="Pratinjau Gambar" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button type="submit" className="bg-green-600 text-white p-2 rounded-md cursor-pointer hover:bg-green-700 transition">
                                    {isEditing ? 'Perbarui Paket' : 'Tambah Paket'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={handleCancelEdit} className="bg-red-600 text-white p-2 rounded-md cursor-pointer hover:bg-red-700 transition">
                                        Batal
                                    </button>
                                )}
                            </div>
                        </form>
                        <div className="flex flex-col gap-4">
                            {packages.map(pkg => (
                                <div key={pkg.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                                    {pkg.image_url && (
                                        <img
                                            src={`http://localhost:8080/assets/images/${pkg.image_url}`}
                                            alt={pkg.nama_paket}
                                            className="w-24 h-24 object-cover rounded-md mr-4"
                                        />
                                    )}
                                    <div className="flex-grow">
                                        <h4 className="font-semibold">{pkg.nama_paket}</h4>
                                        <p className="text-sm text-gray-500">Rp {pkg.harga}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditPackageClick(pkg)} className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition">Edit</button>
                                        <button onClick={() => handleDeletePackage(pkg.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">Hapus</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'bookings':
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
                                        handleDeleteBooking(event.id);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                );
            case 'bookings-data':
                return (
                    <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Detail Pemesanan</h3>
                        {isEditingBooking && (
                            <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                                <h4 className="text-lg font-bold mb-2">Edit Pemesanan</h4>
                                <form onSubmit={handleUpdateBooking} className="grid grid-cols-2 gap-4">
                                    <input type="text" name="nama" value={bookingForm.nama} onChange={handleBookingFormChange} className="p-2 border rounded" placeholder="Nama" />
                                    <input type="email" name="email" value={bookingForm.email} onChange={handleBookingFormChange} className="p-2 border rounded" placeholder="Email" />
                                    <input type="text" name="nomor_whatsapp" value={bookingForm.nomor_whatsapp} onChange={handleBookingFormChange} className="p-2 border rounded" placeholder="Nomor WhatsApp" />
                                    <select name="package_id" value={bookingForm.package_id || ''} onChange={handleBookingFormChange} className="p-2 border rounded">
                                        <option value="">Pilih Paket (opsional)</option>
                                        {packages.map(p => (
                                            <option key={p.id} value={p.id}>{p.nama_paket} - Rp{p.harga}</option>
                                        ))}
                                    </select>
                                    <input type="date" name="tanggal" value={bookingForm.tanggal} onChange={handleBookingFormChange} className="p-2 border rounded" />
                                    <input type="time" name="waktu_mulai" value={bookingForm.waktu_mulai} onChange={handleBookingFormChange} className="p-2 border rounded" />
                                    <input type="time" name="waktu_selesai" value={bookingForm.waktu_selesai} onChange={handleBookingFormChange} className="p-2 border rounded" />
                                    <select name="studio_name" value={bookingForm.studio_name} onChange={handleBookingFormChange} className="p-2 border rounded">
                                        <option value="">Pilih Studio</option>
                                        {studios.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </select>
                                    <input type="number" name="jumlah_orang" value={bookingForm.jumlah_orang} onChange={handleBookingFormChange} className="p-2 border rounded" placeholder="Jumlah Orang" />
                                    <textarea name="catatan" value={bookingForm.catatan} onChange={handleBookingFormChange} className="col-span-2 p-2 border rounded" placeholder="Catatan (opsional)" />
                                    <div className="col-span-2 flex gap-2">
                                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Simpan</button>
                                        <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">Batal</button>
                                        {currentBooking && (
                                            <button type="button" onClick={() => { handleDeleteBooking(currentBooking.id); setIsEditingBooking(false); }} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">Hapus</button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}
                        <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('nama')}>
                                            Nama {renderSortArrow('nama')}
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. WA</th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('studio_name')}>
                                            Studio {renderSortArrow('studio_name')}
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('tanggal')}>
                                            Tanggal {renderSortArrow('tanggal')}
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paket</th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedBookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{booking.nama}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{booking.email}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{booking.nomor_whatsapp}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{booking.studio_name}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatShortDate(booking.tanggal)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{booking.waktu_mulai.substring(0, 5)} - {booking.waktu_selesai.substring(0, 5)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{getPackageName(booking.package_id)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditBookingClick(booking)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'customers':
                return (
                    <div className="p-5 bg-gray-100 rounded-lg flex-grow flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Data Pelanggan</h3>
                        {isEditingCustomer && (
                            <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
                                <h4 className="text-lg font-bold mb-2">Edit Data Pelanggan</h4>
                                <form onSubmit={handleUpdateCustomer} className="grid grid-cols-2 gap-4">
                                    <input type="text" name="nama" value={customerForm.nama} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Nama" />
                                    <input type="email" name="email" value={customerForm.email} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Email" />
                                    <input type="text" name="nomor_whatsapp" value={customerForm.nomor_whatsapp} onChange={handleCustomerFormChange} className="p-2 border rounded" placeholder="Nomor WhatsApp" disabled />
                                    <div className="col-span-2 flex gap-2">
                                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Simpan</button>
                                        <button type="button" onClick={handleCancelEdit} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500">Batal</button>
                                    </div>
                                </form>
                            </div>
                        )}
                        <div className="flex-grow overflow-y-auto bg-white rounded-lg shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('nama')}>
                                            Nama {renderSortArrow('nama')}
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Telpon</th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('total_bookings')}>
                                            Total Pemesanan {renderSortArrow('total_bookings')}
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('last_visit_date')}>
                                            Kunjungan Terakhir {renderSortArrow('last_visit_date')}
                                        </th>
                                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedCustomers.map((customer, index) => (
                                        <tr key={index}>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{customer.nama}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.nomor_whatsapp}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{customer.total_bookings}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{formatLastVisitDate(customer.last_visit_date)}</td>
                                            <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditCustomerClick(customer)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const Modal = ({ title, message, onConfirm, onCancel }) => (
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

    return (
        <div className="flex min-h-screen">
            <div className="w-64 bg-gray-900 text-white p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-8">Admin Panel</h2>
                <nav>
                    <button onClick={() => setActiveTab('posts')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'posts' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Postingan
                    </button>
                    <button onClick={() => setActiveTab('packages')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'packages' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Paket
                    </button>
                    <button onClick={() => setActiveTab('bookings')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'bookings' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Pemesanan
                    </button>
                    <button onClick={() => setActiveTab('bookings-data')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'bookings-data' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Detail Pemesanan
                    </button>
                    <button onClick={() => setActiveTab('customers')} className={`block w-full text-left py-4 px-6 mb-2 rounded-lg transition duration-300 ${activeTab === 'customers' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800'}`}>
                        Data Pelanggan
                    </button>
                    <button onClick={() => {
                        localStorage.removeItem('admin-token');
                        navigate('/admin/login');
                    }} className="block w-full text-left py-4 px-6 rounded-lg transition duration-300 hover:bg-gray-800">
                        Logout
                    </button>
                </nav>
            </div>
            <div className="flex-grow p-6 bg-gray-100">
                <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
                {renderContent()}
            </div>
            {showModal && (
                <Modal
                    title={modalTitle}
                    message={modalMessage}
                    onConfirm={() => {
                        if (modalAction) {
                            modalAction();
                        }
                        setShowModal(false);
                        setModalAction(null);
                    }}
                    onCancel={() => setShowModal(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;