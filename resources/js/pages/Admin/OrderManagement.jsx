import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [msg, setMsg] = useState({ type: '', text: '' });
    
    // State lưu số lượng đơn hàng
    const [counts, setCounts] = useState({ all: 0, pending: 0, shipping: 0, completed: 0, cancelled: 0 });

    // State quản lý phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } };
    const API_URL = 'http://127.0.0.1:8000/api/admin/orders';

    const fetchOrders = async (status = 'all', page = 1) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}?status=${status}&page=${page}`, axiosConfig);
            
            // Xử lý an toàn: Bóc tách dữ liệu dù API trả về mảng hay object phân trang
            if (res.data.data && Array.isArray(res.data.data.data)) {
                // Trường hợp Laravel paginate() trả về
                setOrders(res.data.data.data);
                setCurrentPage(res.data.data.current_page);
                setLastPage(res.data.data.last_page);
            } else if (Array.isArray(res.data.data)) {
                // Trường hợp API trả về mảng trực tiếp
                setOrders(res.data.data);
            }

            // Cập nhật số lượng đếm nếu Backend có trả về
            if (res.data.counts) {
                setCounts(res.data.counts);
            }
        } catch (error) {
            console.error("Lỗi lấy đơn hàng:", error);
            setMsg({ type: 'error', text: 'Không thể tải danh sách đơn hàng.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Khi đổi tab (statusFilter), quay về trang 1
        setCurrentPage(1);
        fetchOrders(statusFilter, 1);
    }, [statusFilter]);

    // Hàm chuyển trang
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= lastPage) {
            fetchOrders(statusFilter, newPage);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Chuyển trạng thái đơn hàng #${orderId} sang "${newStatus}"?`)) return;
        
        try {
            await axios.put(`${API_URL}/${orderId}/status`, { status: newStatus }, axiosConfig);
            setMsg({ type: 'success', text: 'Cập nhật trạng thái thành công!' });
            // Tải lại danh sách ở trang hiện tại
            fetchOrders(statusFilter, currentPage); 
            setTimeout(() => setMsg({ type: '', text: '' }), 3000);
        } catch (error) {
            setMsg({ type: 'error', text: error.response?.data?.message || 'Lỗi cập nhật trạng thái!' });
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-bold whitespace-nowrap">Chờ xác nhận</span>;
            case 'shipping': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold whitespace-nowrap">Đang giao</span>;
            case 'completed': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold whitespace-nowrap">Hoàn thành</span>;
            case 'cancelled': return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold whitespace-nowrap">Đã hủy</span>;
            default: return <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Banner thông báo đơn hàng cần xử lý */}
            {counts.pending > 0 && (
                <div className="mx-6 mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-orange-800">
                        <span className="text-2xl animate-bounce">🔔</span>
                        <p className="font-medium text-sm">
                            Bạn có <strong className="text-lg text-orange-600">{counts.pending}</strong> đơn hàng mới đang chờ xác nhận!
                        </p>
                    </div>
                    <button 
                        onClick={() => setStatusFilter('pending')} 
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition shadow-sm"
                    >
                        Xử lý ngay
                    </button>
                </div>
            )}

            {/* Header & Filter */}
            <div className="p-6 border-b border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="font-serif text-xl font-bold text-[#1A1A1A]">Quản lý Đơn hàng</h2>
                    <p className="text-sm text-stone-500">Theo dõi và cập nhật trạng thái giao hàng</p>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                    {[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'pending', label: 'Chờ xác nhận' },
                        { key: 'shipping', label: 'Đang giao' },
                        { key: 'completed', label: 'Hoàn thành' },
                        { key: 'cancelled', label: 'Đã hủy' }
                    ].map(tab => {
                        // Logic xác định xem có phải tab Chờ xác nhận đang có đơn không
                        const isPendingHighlight = tab.key === 'pending' && counts.pending > 0;
                        const isActive = statusFilter === tab.key;

                        // Cấu hình class cho nút Tab
                        let buttonClass = "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition flex items-center gap-2 ";
                        if (isActive) {
                            buttonClass += isPendingHighlight 
                                ? "bg-orange-600 text-white shadow-md ring-2 ring-orange-300" 
                                : "bg-[#141414] text-white shadow-sm"; 
                        } else {
                            buttonClass += isPendingHighlight
                                ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100" 
                                : "bg-stone-100 text-stone-600 hover:bg-stone-200"; 
                        }

                        // Cấu hình class cho Badge số lượng
                        let badgeClass = "px-2 py-0.5 rounded-full text-[11px] font-bold ";
                        if (isActive) {
                            badgeClass += isPendingHighlight ? "bg-white text-orange-600" : "bg-stone-700 text-white";
                        } else {
                            badgeClass += isPendingHighlight ? "bg-orange-600 text-white" : "bg-stone-200 text-stone-700";
                        }

                        return (
                            <button
                                key={tab.key}
                                onClick={() => setStatusFilter(tab.key)}
                                className={buttonClass}
                            >
                                {tab.label}
                                <span className={badgeClass}>
                                    {counts[tab.key] || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Thông báo Action */}
            {msg.text && (
                <div className={`mx-6 mt-4 p-3 rounded-lg text-sm font-medium border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {msg.text}
                </div>
            )}

            {/* Bảng dữ liệu */}
            <div className="overflow-x-auto mt-4">
                <table className="w-full text-left text-sm text-stone-600 border-collapse">
                    <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-t border-stone-200">
                        <tr>
                            <th className="px-6 py-4">Mã Đơn</th>
                            <th className="px-6 py-4">Khách hàng</th>
                            <th className="px-6 py-4">Ngày đặt</th>
                            <th className="px-6 py-4">Tổng tiền</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-10 text-stone-400">Đang tải dữ liệu...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-10 text-stone-400">Không có đơn hàng nào.</td></tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-stone-50/70 transition">
                                    <td className="px-6 py-4 font-bold text-[#1A1A1A]">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-stone-800">{order.receiver_name || order.user?.username || 'Khách'}</div>
                                        <div className="text-xs text-stone-500">{order.phone || order.shipping_phone || '—'}</div>
                                    </td>
                                    <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td className="px-6 py-4 font-bold text-[#9A5B13]">{Number(order.total_amount).toLocaleString('vi-VN')} đ</td>
                                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                                    <td className="px-6 py-4 text-right">
                                        {/* Logic Dropdown chặn đi lùi */}
                                        {order.status === 'pending' && (
                                            <select 
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className="border border-stone-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9A5B13] bg-white cursor-pointer"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Cập nhật...</option>
                                                <option value="shipping">Giao hàng</option>
                                                <option value="cancelled">Hủy đơn</option>
                                            </select>
                                        )}
                                        {order.status === 'shipping' && (
                                            <select 
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                className="border border-stone-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#9A5B13] bg-white cursor-pointer"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Cập nhật...</option>
                                                <option value="completed">Hoàn thành</option>
                                                <option value="cancelled">Giao thất bại</option>
                                            </select>
                                        )}
                                        {(order.status === 'completed' || order.status === 'cancelled') && (
                                            <span className="text-xs text-stone-400 italic font-medium px-2">Đã chốt</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Phần Giao diện Phân trang */}
            {!loading && orders.length > 0 && (
                <div className="p-6 border-t border-stone-200 flex justify-between items-center">
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
            )}
        </div>
    );
};

export default OrderManagement;