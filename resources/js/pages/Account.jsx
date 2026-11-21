import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ================== DỮ LIỆU ĐỊA CHỈ MẪU ==================
const addressData = {
  'Hồ Chí Minh': {
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Đa Kao', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão'],
    'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường Võ Thị Sáu'],
    'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
    'Quận 7': ['Phường Tân Thuận Đông', 'Phường Tân Thuận Tây', 'Phường Tân Kiểng', 'Phường Tân Hưng', 'Phường Bình Thuận', 'Phường Tân Quy', 'Phường Phú Thuận', 'Phường Tân Phú', 'Phường Tân Phong', 'Phường Phú Mỹ'],
    'Quận 10': ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'],
    'Thành phố Thủ Đức': ['Phường Linh Trung', 'Phường Linh Xuân', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Tam Phú', 'Phường Bình Chiểu', 'Phường Trường Thọ', 'Phường Long Bình', 'Phường Long Thạnh Mỹ', 'Phường Tân Phú'],
  },
  'Hà Nội': {
    'Quận Ba Đình': ['Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc', 'Phường Cống Vị', 'Phường Liễu Giai', 'Phường Nguyễn Trung Trực', 'Phường Quán Thánh', 'Phường Ngọc Hà', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Ngọc Khánh', 'Phường Kim Mã', 'Phường Giảng Võ', 'Phường Thành Công'],
    'Quận Hoàn Kiếm': ['Phường Phúc Tân', 'Phường Đồng Xuân', 'Phường Hàng Mã', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Bồ', 'Phường Cửa Đông', 'Phường Lý Thái Tổ', 'Phường Hàng Bạc', 'Phường Hàng Gai', 'Phường Chương Dương', 'Phường Hàng Trống', 'Phường Cửa Nam', 'Phường Hàng Bông', 'Phường Tràng Tiền', 'Phường Trần Hưng Đạo', 'Phường Phan Chu Trinh', 'Phường Hàng Bài'],
    'Quận Cầu Giấy': ['Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Mai Dịch', 'Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Quan Hoa', 'Phường Yên Hòa', 'Phường Trung Hòa'],
    'Quận Đống Đa': ['Phường Cát Linh', 'Phường Văn Miếu', 'Phường Quốc Tử Giám', 'Phường Láng Thượng', 'Phường Ô Chợ Dừa', 'Phường Văn Chương', 'Phường Hàng Bột', 'Phường Láng Hạ', 'Phường Khâm Thiên', 'Phường Thổ Quan', 'Phường Nam Đồng', 'Phường Trung Phụng', 'Phường Quang Trung', 'Phường Trung Liệt', 'Phường Phương Liên', 'Phường Thịnh Quang', 'Phường Trung Tự', 'Phường Kim Liên', 'Phường Phương Mai', 'Phường Ngã Tư Sở', 'Phường Khương Thượng'],
  },
  'Đà Nẵng': {
    'Quận Hải Châu': ['Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Thạch Thang', 'Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Phước Ninh', 'Phường Hòa Thuận Tây', 'Phường Hòa Thuận Đông', 'Phường Nam Dương', 'Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam'],
    'Quận Thanh Khê': ['Phường Tam Thuận', 'Phường Thanh Khê Tây', 'Phường Thanh Khê Đông', 'Phường Xuân Hà', 'Phường Tân Chính', 'Phường Chính Gián', 'Phường Vĩnh Trung', 'Phường Thạc Gián', 'Phường An Khê', 'Phường Hòa Khê'],
    'Quận Sơn Trà': ['Phường Thọ Quang', 'Phường Nại Hiên Đông', 'Phường Mân Thái', 'Phường An Hải Bắc', 'Phường Phước Mỹ', 'Phường An Hải Tây', 'Phường An Hải Đông'],
  },
};

const streetSuggestions = [
  'Nguyễn Văn Cừ', 'Lê Lợi', 'Trần Hưng Đạo', 'Nguyễn Huệ', 'Lý Tự Trọng',
  'Hai Bà Trưng', 'Điện Biên Phủ', 'Cách Mạng Tháng 8', 'Nguyễn Thị Minh Khai',
  'Võ Văn Tần', 'Pasteur', 'Nam Kỳ Khởi Nghĩa', 'Đinh Tiên Hoàng', 'Phan Xích Long',
  'Hoàng Văn Thụ', 'Phan Đăng Lưu', 'Nguyễn Đình Chiểu', 'Lê Văn Sỹ', 'Cộng Hòa',
  'Trường Chinh', 'Tô Hiến Thành', 'Sư Vạn Hạnh', 'An Dương Vương', 'Hùng Vương',
];

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
  });

  const [addressForm, setAddressForm] = useState({
    city: '',
    district: '',
    ward: '',
    street: '',
  });

  const [streetSuggestList, setStreetSuggestList] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  // ===== Fetch profile =====
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/profile');
        if (response.data?.user) {
          const user = response.data.user;
          setProfile({
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            address: user.address || '',
          });
        }
      } catch (error) {
        console.error(error);
        setProfile({
          username: 'customer1',
          email: 'customer1@gmail.com',
          phone: '0912 345 678',
          address: '',
        });
        setProfileMsg({
          type: 'error',
          text: 'Không thể tải thông tin từ server. Đang hiển thị dữ liệu tạm.',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ===== Address handlers =====
  const handleCityChange = (e) => {
    setAddressForm({
      city: e.target.value,
      district: '',
      ward: '',
      street: addressForm.street,
    });
  };

  const handleDistrictChange = (e) => {
    setAddressForm({
      ...addressForm,
      district: e.target.value,
      ward: '',
    });
  };

  const handleWardChange = (e) => {
    setAddressForm({ ...addressForm, ward: e.target.value });
  };

  const handleStreetChange = (e) => {
    const value = e.target.value;
    setAddressForm({ ...addressForm, street: value });

    if (value.trim().length >= 2) {
      const filtered = streetSuggestions.filter((s) =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setStreetSuggestList(filtered.slice(0, 6));
      setShowSuggest(true);
    } else {
      setShowSuggest(false);
    }
  };

  const selectStreetSuggestion = (street) => {
    const current = addressForm.street.trim();
    const numberMatch = current.match(/^(\d+[\/\w]*)\s*/);
    const number = numberMatch ? numberMatch[1] + ' ' : '';
    setAddressForm({ ...addressForm, street: number + street });
    setShowSuggest(false);
  };

  const buildFullAddress = () => {
    const parts = [];
    if (addressForm.street) parts.push(addressForm.street);
    if (addressForm.ward) parts.push(addressForm.ward);
    if (addressForm.district) parts.push(addressForm.district);
    if (addressForm.city) parts.push(addressForm.city);
    return parts.join(', ');
  };

  // ===== Profile Submit =====
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    const fullAddress = buildFullAddress();
    if (!fullAddress && !profile.address) {
      setProfileMsg({ type: 'error', text: 'Vui lòng nhập đầy đủ địa chỉ nhận hàng.' });
      return;
    }

    setLoadingProfile(true);
    try {
      const res = await axios.put('/api/profile', {
        username: profile.username,
        phone: profile.phone,
        address: fullAddress || profile.address,
      });
      setProfile((prev) => ({
        ...prev,
        address: fullAddress || prev.address,
      }));
      setProfileMsg({
        type: 'success',
        text: res.data.message || 'Cập nhật hồ sơ thành công!',
      });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // ===== Password handlers =====
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwords.new_password.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 8 ký tự.' });
      return;
    }
    if (passwords.new_password !== passwords.new_password_confirmation) {
      setPasswordMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await axios.put('/api/profile/change-password', passwords);
      setPasswordMsg({
        type: 'success',
        text: res.data.message || 'Đổi mật khẩu thành công!',
      });
      setPasswords({
        old_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.',
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  // ===== Icons =====
  const IconUser = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
  const IconLock = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
  const IconPackage = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
  const IconPhone = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
  const IconMap = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
  const IconEye = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const IconEyeOff = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  const districts = addressForm.city ? Object.keys(addressData[addressForm.city] || {}) : [];
  const wards =
    addressForm.city && addressForm.district
      ? addressData[addressForm.city][addressForm.district] || []
      : [];

  return (
    <div className="min-h-screen bg-[#F9F6F0]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tài khoản của tôi</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân, mật khẩu và đơn hàng</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ========== SIDEBAR ========== */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-8 text-center border-b border-amber-100">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.username ? profile.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-800">
                  {profile.username || 'Khách hàng'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{profile.email}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                  Thành viên
                </span>
              </div>

              <nav className="p-3 space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'profile'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconUser />
                  Thông tin cá nhân
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'password'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconLock />
                  Đổi mật khẩu
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'orders'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconPackage />
                  Đơn hàng của tôi
                </button>
              </nav>
            </div>
          </div>

          {/* ========== MAIN CONTENT ========== */}
          <div className="lg:col-span-8 space-y-6">
            {/* ===== TAB PROFILE ===== */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
                    <IconUser className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Thông tin cá nhân</h3>
                    <p className="text-sm text-gray-500">
                      Cập nhật họ tên, số điện thoại và địa chỉ nhận hàng
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  {profileMsg.text && (
                    <div
                      className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium ${
                        profileMsg.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {profileMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email đăng nhập
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    {/* Họ tên */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                          <IconUser />
                        </div>
                        <input
                          type="text"
                          value={profile.username}
                          onChange={(e) =>
                            setProfile({ ...profile, username: e.target.value })
                          }
                          required
                          placeholder="Nhập họ và tên"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    {/* SĐT */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                          <IconPhone />
                        </div>
                        <input
                          type="text"
                          value={profile.phone}
                          onChange={(e) =>
                            setProfile({ ...profile, phone: e.target.value })
                          }
                          placeholder="Ví dụ: 0912 345 678"
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    {/* ========== ĐỊA CHỈ ========== */}
                    <div className="pt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Địa chỉ nhận hàng <span className="text-red-500">*</span>
                      </label>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Thành phố */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Tỉnh / Thành phố
                          </label>
                          <select
                            value={addressForm.city}
                            onChange={handleCityChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white"
                          >
                            <option value="">-- Chọn tỉnh/thành --</option>
                            {Object.keys(addressData).map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quận */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Quận / Huyện
                          </label>
                          <select
                            value={addressForm.district}
                            onChange={handleDistrictChange}
                            disabled={!addressForm.city}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                          >
                            <option value="">-- Chọn quận/huyện --</option>
                            {districts.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Phường */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Phường / Xã
                          </label>
                          <select
                            value={addressForm.ward}
                            onChange={handleWardChange}
                            disabled={!addressForm.district}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                          >
                            <option value="">-- Chọn phường/xã --</option>
                            {wards.map((w) => (
                              <option key={w} value={w}>
                                {w}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Số nhà + đường */}
                        <div className="relative">
                          <label className="block text-xs text-gray-500 mb-1">
                            Số nhà, tên đường
                          </label>
                          <input
                            type="text"
                            value={addressForm.street}
                            onChange={handleStreetChange}
                            onFocus={() =>
                              addressForm.street.length >= 2 && setShowSuggest(true)
                            }
                            onBlur={() => setTimeout(() => setShowSuggest(false), 200)}
                            placeholder="VD: 123 Nguyễn Văn Cừ"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                          />

                          {showSuggest && streetSuggestList.length > 0 && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                              {streetSuggestList.map((street) => (
                                <button
                                  key={street}
                                  type="button"
                                  onClick={() => selectStreetSuggestion(street)}
                                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 transition"
                                >
                                  {street}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preview */}
                      {buildFullAddress() && (
                        <div className="mt-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-900">
                          <span className="font-medium">Địa chỉ đầy đủ:</span>{' '}
                          {buildFullAddress()}
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loadingProfile}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold transition shadow-sm flex items-center justify-center gap-2"
                    >
                      {loadingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ===== TAB PASSWORD ===== */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700">
                    <IconLock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Đổi mật khẩu</h3>
                    <p className="text-sm text-gray-500">
                      Để bảo mật, vui lòng nhập mật khẩu hiện tại
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  {passwordMsg.text && (
                    <div
                      className={`mb-5 px-4 py-3 rounded-xl text-sm font-medium ${
                        passwordMsg.type === 'success'
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {passwordMsg.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
                    {/* Mật khẩu hiện tại */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                          <IconLock />
                        </div>
                        <input
                          type={showPassword.old ? 'text' : 'password'}
                          name="old_password"
                          value={passwords.old_password}
                          onChange={handlePasswordChange}
                          required
                          placeholder="Nhập mật khẩu hiện tại"
                          className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({ ...showPassword, old: !showPassword.old })
                          }
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.old ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    {/* Mật khẩu mới */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                          <IconLock />
                        </div>
                        <input
                          type={showPassword.new ? 'text' : 'password'}
                          name="new_password"
                          value={passwords.new_password}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          placeholder="Tối thiểu 8 ký tự"
                          className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({ ...showPassword, new: !showPassword.new })
                          }
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.new ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    {/* Xác nhận */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                          <IconLock />
                        </div>
                        <input
                          type={showPassword.confirm ? 'text' : 'password'}
                          name="new_password_confirmation"
                          value={passwords.new_password_confirmation}
                          onChange={handlePasswordChange}
                          required
                          minLength={8}
                          placeholder="Nhập lại mật khẩu mới"
                          className="w-full pl-11 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              confirm: !showPassword.confirm,
                            })
                          }
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword.confirm ? <IconEyeOff /> : <IconEye />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loadingPassword}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold transition shadow-sm flex items-center justify-center gap-2"
                    >
                      {loadingPassword ? (
                        <>
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Đang xử lý...
                        </>
                      ) : (
                        'Đổi mật khẩu'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ===== TAB ORDERS ===== */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 rounded-xl text-blue-700">
                    <IconPackage className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Đơn hàng của tôi</h3>
                    <p className="text-sm text-gray-500">
                      Theo dõi và quản lý các đơn hàng đã đặt
                    </p>
                  </div>
                </div>

                <div className="p-10 text-center">
                  <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <IconPackage className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-700 mb-2">
                    Chưa có đơn hàng nào
                  </h4>
                  <p className="text-gray-500 text-sm mb-6">
                    Khi bạn đặt hàng, danh sách đơn sẽ hiển thị tại đây.
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-xl transition"
                  >
                    Tiếp tục mua sắm
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;