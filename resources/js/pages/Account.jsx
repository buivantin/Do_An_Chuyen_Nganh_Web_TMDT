import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Account = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState({ username: '', email: '', phone: '', address: '', image_path: null });
    
    // State cho Form
    const [profileForm, setProfileForm] = useState({ username: '', phone: '', address: '' });
    const [passwordForm, setPasswordForm] = useState({ 
        old_password: '', 
        new_password: '', 
        new_password_confirmation: '' 
    });
    
    // State cho Địa chỉ (Tỉnh/Quận/Phường)
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [streetAddress, setStreetAddress] = useState(''); 

    // State cho UI
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const token = localStorage.getItem('token');
    const API_URL = 'http://127.0.0.1:8000/api'; 
    const axiosConfig = { 
        headers: { 
            ...(token ? { Authorization: `Bearer ${token}` } : {}), 
            Accept: 'application/json' 
        }
    };

    // 1. Tải dữ liệu Tỉnh/Thành phố từ API
    useEffect(() => {
        axios.get('https://provinces.open-api.vn/api/p/')
            .then(res => setProvinces(res.data))
            .catch(err => console.error("Lỗi tải Tỉnh/Thành:", err));
    }, []);

    // Xử lý khi chọn Tỉnh/Thành
    const handleProvinceChange = (e) => {
        const pCode = e.target.value;
        setSelectedProvince(pCode);
        setSelectedDistrict('');
        setSelectedWard('');
        setDistricts([]);
        setWards([]);

        if (pCode) {
            axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`)
                .then(res => setDistricts(res.data.districts))
                .catch(err => console.error(err));
        }
    };

    // Xử lý khi chọn Quận/Huyện
    const handleDistrictChange = (e) => {
        const dCode = e.target.value;
        setSelectedDistrict(dCode);
        setSelectedWard('');
        setWards([]);

        if (dCode) {
            axios.get(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`)
                .then(res => setWards(res.data.wards))
                .catch(err => console.error(err));
        }
    };

    // 2. Tải thông tin User
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API_URL}/profile`, axiosConfig);
                setUser(res.data.user);
                setProfileForm({
                    username: res.data.user.username || '',
                    phone: res.data.user.phone || '',
                    address: res.data.user.address || ''
                });
                
                if (res.data.user.address) {
                    setStreetAddress(res.data.user.address);
                }
            } catch (error) {
                console.error("Lỗi API:", error);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setMsg({ type: 'error', text: 'Phiên đăng nhập hết hạn. Đang chuyển về trang chủ...' });
                    setTimeout(() => { window.location.href = '/'; }, 2000);
                } else {
                    setMsg({ type: 'error', text: 'Không thể kết nối đến máy chủ API.' });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // 3. Xử lý Upload ảnh
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setSaving(true);
            setMsg({ type: '', text: '' });
            const res = await axios.post(`${API_URL}/profile/avatar`, formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });
            setUser({ ...user, image_path: res.data.image_path });
            
            const storedUser = JSON.parse(localStorage.getItem('user')) || {};
            localStorage.setItem('user', JSON.stringify({ ...storedUser, image_path: res.data.image_path }));
            
            setMsg({ type: 'success', text: 'Cập nhật ảnh đại diện thành công!' });
        } catch (error) {
            setMsg({ type: 'error', text: 'Lỗi upload ảnh.' });
        } finally {
            setSaving(false);
        }
    };

    // 4. Cập nhật thông tin (Ghép chuỗi địa chỉ)
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg({ type: '', text: '' });

        let finalAddress = streetAddress.trim();
        if (selectedWard) {
            const wardName = wards.find(w => w.code === Number(selectedWard))?.name;
            if (wardName) finalAddress += `, ${wardName}`;
        }
        if (selectedDistrict) {
            const districtName = districts.find(d => d.code === Number(selectedDistrict))?.name;
            if (districtName) finalAddress += `, ${districtName}`;
        }
        if (selectedProvince) {
            const provinceName = provinces.find(p => p.code === Number(selectedProvince))?.name;
            if (provinceName) finalAddress += `, ${provinceName}`;
        }

        finalAddress = finalAddress.replace(/^,|,$/g, '').trim();
        const dataToSubmit = { ...profileForm, address: finalAddress };

        try {
            const res = await axios.put(`${API_URL}/profile`, dataToSubmit, axiosConfig);
            setUser({ ...user, ...dataToSubmit });
            setProfileForm({ ...profileForm, address: finalAddress });
            localStorage.setItem('user', JSON.stringify({ ...user, ...dataToSubmit }));
            setMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.message || 'Có lỗi xảy ra khi lưu!' });
        } finally {
            setSaving(false);
        }
    };

    // 5. Đổi mật khẩu
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }
        setSaving(true);
        setMsg({ type: '', text: '' });
        try {
            const res = await axios.put(`${API_URL}/profile/change-password`, passwordForm, axiosConfig);
            setMsg({ type: 'success', text: res.data.message || 'Đổi mật khẩu thành công!' });
            setPasswordForm({ old_password: '', new_password: '', new_password_confirmation: '' });
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.message || 'Mật khẩu cũ không đúng!' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-[50vh] flex items-center justify-center bg-[#F9F6F0]">Đang tải thông tin...</div>;

    return (
        <div className="bg-[#F9F6F0] py-10 min-h-[calc(100vh-200px)]">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    
                    {/* SIDEBAR TRÁI */}
                    <div className="md:col-span-4 lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center sticky top-24">
                            <div className="relative group cursor-pointer mb-4" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-amber-100 shadow-sm">
                                    {user.image_path ? (
                                        <img src={`http://127.0.0.1:8000/${user.image_path}`} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-amber-500 text-white flex items-center justify-center text-3xl font-bold">
                                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-medium">Đổi ảnh</span>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                            </div>
                            
                            <h2 className="text-lg font-bold text-gray-800 text-center">{user.username}</h2>
                            <p className="text-sm text-gray-500 mb-6">{user.email}</p>

                            <div className="w-full space-y-1">
                                <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'profile' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    Thông tin cá nhân
                                </button>
                                <button onClick={() => setActiveTab('password')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'password' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    Đổi mật khẩu
                                </button>
                                <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${activeTab === 'orders' ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                    Đơn hàng của tôi
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* NỘI DUNG CHÍNH BÊN PHẢI */}
                    <div className="md:col-span-8 lg:col-span-9">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
                            
                            {/* Thông báo */}
                            {msg.text && (
                                <div className={`mb-6 p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {msg.text}
                                </div>
                            )}

                            {/* TAB: HỒ SƠ CÁ NHÂN */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Hồ sơ cá nhân</h3>
                                    <form onSubmit={handleUpdateProfile} className="max-w-3xl space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email đăng nhập (Không thể đổi)</label>
                                            <input 
                                                type="text" 
                                                value={user.email} 
                                                disabled 
                                                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed" 
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.username} 
                                                    onChange={(e) => setProfileForm({...profileForm, username: e.target.value})} 
                                                    required 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.phone} 
                                                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} 
                                                    placeholder="Chưa cập nhật" 
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                                                />
                                            </div>
                                        </div>

                                        {/* PHẦN ĐỊA CHỈ */}
                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                                            <h4 className="font-semibold text-gray-800 text-sm mb-2">Địa chỉ nhận hàng</h4>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Tỉnh / Thành phố</label>
                                                    <select 
                                                        value={selectedProvince} 
                                                        onChange={handleProvinceChange} 
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                                                    >
                                                        <option value="">Chọn Tỉnh/Thành</option>
                                                        {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Quận / Huyện</label>
                                                    <select 
                                                        value={selectedDistrict} 
                                                        onChange={handleDistrictChange} 
                                                        disabled={!selectedProvince} 
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white disabled:bg-gray-100"
                                                    >
                                                        <option value="">Chọn Quận/Huyện</option>
                                                        {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1">Phường / Xã</label>
                                                    <select 
                                                        value={selectedWard} 
                                                        onChange={(e) => setSelectedWard(e.target.value)} 
                                                        disabled={!selectedDistrict} 
                                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white disabled:bg-gray-100"
                                                    >
                                                        <option value="">Chọn Phường/Xã</option>
                                                        {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Số nhà, tên đường</label>
                                                <input 
                                                    type="text" 
                                                    value={streetAddress} 
                                                    onChange={(e) => setStreetAddress(e.target.value)} 
                                                    placeholder="VD: 123 Nguyễn Văn Cừ" 
                                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm" 
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 italic mt-2">Địa chỉ hiện tại trên hệ thống: {user.address || 'Chưa có'}</p>
                                        </div>

                                        <button type="submit" disabled={saving} className="px-6 py-3 bg-[#141414] text-white font-semibold rounded-lg hover:bg-stone-800 transition disabled:opacity-50">
                                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* TAB: ĐỔI MẬT KHẨU */}
                            {activeTab === 'password' && (
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-3">Đổi mật khẩu</h3>
                                    <form onSubmit={handleChangePassword} className="max-w-2xl space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại <span className="text-red-500">*</span></label>
                                            <input 
                                                type="password" 
                                                value={passwordForm.old_password} 
                                                onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})} 
                                                required 
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới (>= 8 ký tự) <span className="text-red-500">*</span></label>
                                            <input 
                                                type="password" 
                                                value={passwordForm.new_password} 
                                                onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} 
                                                required 
                                                minLength="8" 
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới <span className="text-red-500">*</span></label>
                                            <input 
                                                type="password" 
                                                value={passwordForm.new_password_confirmation} 
                                                onChange={(e) => setPasswordForm({...passwordForm, new_password_confirmation: e.target.value})} 
                                                required 
                                                minLength="8" 
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                                            />
                                        </div>
                                        <button type="submit" disabled={saving} className="px-6 py-3 bg-[#141414] text-white font-semibold rounded-lg hover:bg-stone-800 transition disabled:opacity-50">
                                            {saving ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* TAB: ĐƠN HÀNG */}
                            {activeTab === 'orders' && (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">📦</div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
                                    <p className="text-gray-500 mb-6">Khi bạn mua sách, đơn hàng sẽ hiển thị tại đây.</p>
                                    <a href="/" className="inline-block px-6 py-3 bg-[#141414] text-white font-semibold rounded-lg hover:bg-stone-800 transition">Tiếp tục mua sắm</a>
                                </div>
                            )}
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;