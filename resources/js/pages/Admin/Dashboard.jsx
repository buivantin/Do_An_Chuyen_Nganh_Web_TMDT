import React, { useMemo, useState } from 'react';

const INITIAL_ORDERS = [
  { id: 10, receiver: 'Nguyễn Văn 10', phone: '0987654310', method: 'COD', total: 340000, status: 'pending', created_at: '2026-11-22' },
  { id: 9,  receiver: 'Nguyễn Văn 9',  phone: '0987654309', method: 'VNPAY', total: 520000, status: 'pending', created_at: '2026-11-22' },
  { id: 8,  receiver: 'Nguyễn Văn 8',  phone: '0987654308', method: 'COD', total: 195000, status: 'shipping', created_at: '2026-11-21' },
  { id: 7,  receiver: 'Nguyễn Văn 7',  phone: '0987654307', method: 'VNPAY', total: 460000, status: 'shipping', created_at: '2026-11-20' },
  { id: 6,  receiver: 'Nguyễn Văn 6',  phone: '0987654306', method: 'COD', total: 280000, status: 'completed', created_at: '2026-11-18' },
  { id: 5,  receiver: 'Nguyễn Văn 5',  phone: '0987654305', method: 'VNPAY', total: 610000, status: 'completed', created_at: '2026-11-15' },
  { id: 4,  receiver: 'Nguyễn Văn 4',  phone: '0987654304', method: 'COD', total: 150000, status: 'cancelled', created_at: '2026-11-13' },
];

// Dữ liệu doanh thu mẫu theo ngày (chỉ tính đơn completed) để biểu đồ phản hồi theo lịch
const DAILY_REVENUE_RECORDS = [
  { date: '2026-11-02', revenue: 420000 },
  { date: '2026-11-05', revenue: 680000 },
  { date: '2026-11-08', revenue: 510000 },
  { date: '2026-11-10', revenue: 890000 },
  { date: '2026-11-12', revenue: 740000 },
  { date: '2026-11-15', revenue: 610000 },
  { date: '2026-11-18', revenue: 280000 },
  { date: '2026-11-20', revenue: 950000 },
  { date: '2026-11-21', revenue: 1120000 },
  { date: '2026-11-22', revenue: 840000 },
];

const TOP_PRODUCTS = [
  { rank: 1, name: 'Nhà Giả Kim', author: 'Paulo Coelho', sold: 42, price: 85000, stock: 1 },
  { rank: 2, name: 'Đắc Nhân Tâm', author: 'Dale Carnegie', sold: 36, price: 96000, stock: 54 },
  { rank: 3, name: 'Tối Ưu Hóa CSDL Với MySQL', author: 'Baron Schwartz', sold: 29, price: 240000, stock: 28 },
  { rank: 4, name: 'Cây Cam Ngọt Của Tôi', author: 'José Mauro', sold: 24, price: 108000, stock: 41 },
  { rank: 5, name: 'Lập Trình Web Với Laravel', author: 'Matt Stauffer', sold: 21, price: 215000, stock: 19 },
];

const STATUS_META = {
  pending:   { label: 'Chờ xác nhận', badge: 'bg-amber-100 text-amber-800', bar: 'bg-amber-500' },
  shipping:  { label: 'Đang giao',    badge: 'bg-blue-100 text-blue-800',   bar: 'bg-blue-600' },
  completed: { label: 'Hoàn thành',   badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-600' },
  cancelled: { label: 'Đã hủy',       badge: 'bg-rose-100 text-rose-800',   bar: 'bg-rose-500' },
};

const ALLOWED_TRANSITIONS = {
  pending: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

const formatVND = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' ₫';

const formatShortDate = (isoDate) => {
  if (!isoDate) return '';
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
};

export default function Dashboard() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState('all');

  // State khoảng thời gian lọc biểu đồ
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-22');
  const [dateError, setDateError] = useState('');

  // Kiểm tra điều kiện: Ngày bắt đầu không được lớn hơn ngày kết thúc
  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    if (!newStart) return;

    if (endDate && newStart > endDate) {
      setDateError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
      return;
    }

    setDateError('');
    setStartDate(newStart);
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    if (!newEnd) return;

    if (startDate && newEnd < startDate) {
      setDateError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
      return;
    }

    setDateError('');
    setEndDate(newEnd);
  };

  // Lọc dữ liệu doanh thu theo khoảng ngày đã chọn
  const filteredRevenueSeries = useMemo(() => {
    return DAILY_REVENUE_RECORDS.filter(
      (item) => item.date >= startDate && item.date <= endDate
    );
  }, [startDate, endDate]);

  const totalPeriodRevenue = useMemo(
    () => filteredRevenueSeries.reduce((sum, item) => sum + item.revenue, 0),
    [filteredRevenueSeries]
  );

  const maxRevenue = useMemo(
    () => Math.max(...filteredRevenueSeries.map((item) => item.revenue), 1),
    [filteredRevenueSeries]
  );

  const statusCounts = orders.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { pending: 0, shipping: 0, completed: 0, cancelled: 0 }
  );

  const handleStatusChange = (orderId, nextStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (!ALLOWED_TRANSITIONS[order.status].includes(nextStatus)) {
          alert('Không được phép chuyển ngược trạng thái đơn hàng!');
          return order;
        }
        return { ...order, status: nextStatus };
      })
    );
  };

  const filteredOrders =
    statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* 4 Thẻ chỉ số tổng quan (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Doanh thu kỳ đã chọn
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1A1A1A]">
            {formatVND(totalPeriodRevenue)}
          </div>
          <div className="mt-1.5 text-xs text-emerald-700 font-medium">
            {formatShortDate(startDate)} &ndash; {formatShortDate(endDate)} (Đơn hoàn thành)
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Tổng đơn hàng
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1A1A1A]">{orders.length} đơn</div>
          <div className="mt-1.5 text-xs text-stone-600">
            <span className="text-[#9A5B13] font-semibold">{statusCounts.pending} chờ xác nhận</span> ·{' '}
            <span className="text-blue-700 font-semibold">{statusCounts.shipping} đang giao</span>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Đầu sách trong kho
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1A1A1A]">100 cuốn</div>
          <div className="mt-1.5 text-xs text-rose-600 font-medium">
            1 sắp hết (tồn = 1) · 1 hết hàng (tồn = 0)
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Khách hàng hệ thống
          </div>
          <div className="mt-2 text-2xl font-bold text-[#1A1A1A]">10 tài khoản</div>
          <div className="mt-1.5 text-xs text-stone-600">
            9 hoạt động · <span className="text-rose-600 font-medium">1 bị khóa (customer10)</span>
          </div>
        </div>
      </div>

      {/* Biểu đồ doanh thu theo lịch & Phân bổ 4 trạng thái đơn hàng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Biểu đồ doanh thu theo ngày
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Đơn vị: VNĐ — Chỉ tổng hợp đơn hàng Hoàn thành
              </p>
            </div>

            {/* Bộ chọn lịch Từ ngày - Đến ngày */}
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-1.5">
                  <span className="text-xs font-medium text-stone-500">Từ:</span>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate}
                    onChange={handleStartDateChange}
                    className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-1.5">
                  <span className="text-xs font-medium text-stone-500">Đến:</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={handleEndDateChange}
                    className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {dateError && (
                <span className="text-xs font-medium text-rose-600">
                  {dateError}
                </span>
              )}
            </div>
          </div>

          {filteredRevenueSeries.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-stone-400 border border-dashed border-stone-200 rounded-xl">
              Không có dữ liệu doanh thu hoàn thành trong khoảng thời gian này.
            </div>
          ) : (
            <>
              <div className="h-56 flex items-end gap-2 sm:gap-3 pt-6 border-b border-stone-100">
                {filteredRevenueSeries.map((item) => {
                  const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                  return (
                    <div
                      key={item.date}
                      className="flex-1 flex flex-col items-center group h-full justify-end"
                    >
                      <span className="text-[10px] font-semibold text-stone-600 opacity-0 group-hover:opacity-100 transition mb-1 whitespace-nowrap">
                        {(item.revenue / 1000).toLocaleString('vi-VN')}k
                      </span>
                      <div
                        style={{ height: `${Math.max(heightPercent, 6)}%` }}
                        title={`${formatShortDate(item.date)}: ${formatVND(item.revenue)}`}
                        className="w-full max-w-[34px] rounded-t-lg bg-[#9A5B13] hover:bg-[#7d490e] transition-all"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 sm:gap-3 pt-2.5">
                {filteredRevenueSeries.map((item) => (
                  <div
                    key={item.date}
                    className="flex-1 text-center text-xs font-medium text-stone-500"
                  >
                    {formatShortDate(item.date)}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Phân bổ 4 trạng thái đơn */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Trạng thái đơn hàng
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 mb-5">
              Phân bổ theo luồng 4 trạng thái nghiệp vụ
            </p>

            <div className="space-y-4">
              {Object.entries(STATUS_META).map(([key, meta]) => {
                const count = statusCounts[key] || 0;
                const percent = orders.length ? Math.round((count / orders.length) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-stone-700">{meta.label}</span>
                      <span className="text-[#1A1A1A] font-semibold">
                        {count} đơn ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${meta.bar}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500 leading-relaxed">
            Luồng xử lý 1 chiều: <strong className="text-stone-700">Chờ xác nhận</strong> &rarr;{' '}
            <strong className="text-stone-700">Đang giao</strong> &rarr;{' '}
            <strong className="text-stone-700">Hoàn thành</strong>.
          </div>
        </div>
      </div>

      {/* Top 5 sản phẩm bán chạy & Bảng xử lý đơn hàng gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
            Top 5 sách bán chạy
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 mb-4">
            Thống kê dựa trên các đơn đã hoàn thành
          </p>

          <div className="divide-y divide-stone-100">
            {TOP_PRODUCTS.map((book) => (
              <div key={book.rank} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                      book.rank === 1
                        ? 'bg-[#9A5B13] text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {book.rank}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#1A1A1A] truncate">
                      {book.name}
                    </div>
                    <div className="text-xs text-stone-500">
                      {book.author} ·{' '}
                      <span className={book.stock <= 1 ? 'text-rose-600 font-semibold' : ''}>
                        Tồn kho: {book.stock}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-[#1A1A1A]">{book.sold} cuốn</div>
                  <div className="text-xs text-stone-500">{formatVND(book.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Đơn hàng cần xử lý
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Cập nhật trạng thái giao hàng trực tiếp
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold border border-stone-200 rounded-xl px-3 py-2 bg-[#FAF8F5] text-stone-700 focus:outline-none focus:border-[#9A5B13]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="shipping">Đang giao</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
                  <th className="py-2.5 pr-3">Mã đơn</th>
                  <th className="py-2.5 px-3">Người nhận</th>
                  <th className="py-2.5 px-3">Tổng tiền</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                  <th className="py-2.5 pl-3 text-right">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => {
                  const meta = STATUS_META[order.status];
                  return (
                    <tr key={order.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 pr-3 font-semibold text-[#1A1A1A]">
                        #DH{String(order.id).padStart(4, '0')}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-800">{order.receiver}</div>
                        <div className="text-xs text-stone-500">
                          {order.phone} · {order.method}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#1A1A1A] whitespace-nowrap">
                        {formatVND(order.total)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 pl-3 text-right whitespace-nowrap">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(order.id, 'shipping')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#9A5B13] text-white hover:bg-[#7d490e] transition"
                            >
                              Giao hàng
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition ml-1"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                        {order.status === 'shipping' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(order.id, 'completed')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            >
                              Hoàn thành
                            </button>
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelled')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition ml-1"
                            >
                              Hủy
                            </button>
                          </>
                        )}
                        {(order.status === 'completed' || order.status === 'cancelled') && (
                          <span className="text-xs text-stone-400 italic">Đã khóa</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}