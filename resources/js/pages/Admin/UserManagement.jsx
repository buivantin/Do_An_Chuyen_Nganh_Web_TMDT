import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // State quản lý phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchUsers = async (searchKeyword = '', page = 1) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/users?keyword=${searchKeyword}&page=${page}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            });
            
            // Lấy dữ liệu mảng user và thông tin trang từ API
            setUsers(response.data.data.data);
            setCurrentPage(response.data.data.current_page);
            setLastPage(response.data.data.last_page);
            
        } catch (error) {
            console.error("Lỗi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(keyword, 1);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Khi tìm kiếm thì quay về trang 1
        fetchUsers(keyword, 1);
    };

    // Hàm chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            fetchUsers(keyword, newPage);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://127.0.0.1:8000/api/admin/users/${id}/toggle-status`, {}, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
            });
            fetchUsers(keyword, currentPage); // Tải lại trang hiện tại
        } catch (error) {
            alert("Thao tác thất bại!");
        }
    };

    return (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-800">Danh sách Người Dùng</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Tìm theo email..." 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="border border-stone-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#9A5B13]"
                    />
                    <button type="submit" className="bg-[#141414] text-white px-4 py-2 rounded-lg text-sm hover:bg-stone-800 transition">
                        Tìm kiếm
                    </button>
                </form>
            </div>

            {loading ? (
                <p className="text-center text-stone-500 py-10">Đang tải dữ liệu...</p>
            ) : (
                <>
                    <table className="w-full text-left border-collapse mb-4">
                        <thead>
                            <tr className="bg-stone-50 text-stone-600 text-sm border-b border-stone-200">
                                <th className="p-4 font-semibold">ID</th>
                                <th className="p-4 font-semibold">Username</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Vai trò</th>
                                <th className="p-4 font-semibold">Trạng thái</th>
                                <th className="p-4 font-semibold text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-stone-100 hover:bg-stone-50 transition">
                                    <td className="p-4 text-sm">{user.id}</td>
                                    <td className="p-4 text-sm font-medium">{user.username}</td>
                                    <td className="p-4 text-sm text-stone-500">{user.email}</td>
                                    <td className="p-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {user.status === 'active' ? 
                                            <span className="text-green-600 font-medium">Hoạt động</span> : 
                                            <span className="text-red-600 font-medium">Đã khóa</span>
                                        }
                                    </td>
                                    <td className="p-4 text-sm text-center">
                                        <button 
                                            onClick={() => handleToggleStatus(user.id)}
                                            className={`px-4 py-1.5 rounded-lg text-white text-xs font-medium transition ${
                                                user.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                                            }`}
                                        >
                                            {user.status === 'active' ? 'Khóa' : 'Mở khóa'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Phần Giao diện Phân trang */}
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-stone-500">
                            Trang {currentPage} / {lastPage}
                        </span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-stone-300 rounded-lg text-sm disabled:opacity-50 hover:bg-stone-50 transition"
                            >
                                Trang trước
                            </button>
                            <button 
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === lastPage}
                                className="px-4 py-2 border border-stone-300 rounded-lg text-sm disabled:opacity-50 hover:bg-stone-50 transition"
                            >
                                Trang sau
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserManagement;