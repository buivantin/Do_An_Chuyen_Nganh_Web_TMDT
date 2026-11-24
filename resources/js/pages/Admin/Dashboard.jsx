import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import AdminConfirmModal from '../../components/admin/AdminConfirmModal';

const DEFAULT_START_DATE = '2026-01-01';
const DEFAULT_END_DATE = '2026-11-23';

const STATUS_META = {
  pending:    { label: 'Chờ xác nhận',  badge: 'bg-amber-100 text-amber-800',     bar: 'bg-amber-500' },
  processing: { label: 'Chuẩn bị hàng', badge: 'bg-indigo-100 text-indigo-800',   bar: 'bg-indigo-500' },
  shipping:   { label: 'Đang giao',     badge: 'bg-blue-100 text-blue-800',       bar: 'bg-blue-600' },
  completed:  { label: 'Đã hoàn thành', badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-600' },
  cancelled:  { label: 'Đã hủy',        badge: 'bg-rose-100 text-rose-800',       bar: 'bg-rose-500' },
};

const formatVND = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' ₫';

const formatFullDate = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

function StarRating({ rating }) {
  return (
    <div className="inline-flex items-center gap-0.5" title={`${rating}/5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [booksSummary, setBooksSummary] = useState({ total: 0, low_stock: 0, out_of_stock: 0 });

  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const [startDateInput, setStartDateInput] = useState(DEFAULT_START_DATE);
  const [endDateInput, setEndDateInput] = useState(DEFAULT_END_DATE);
  const [appliedStartDate, setAppliedStartDate] = useState(DEFAULT_START_DATE);
  const [appliedEndDate, setAppliedEndDate] = useState(DEFAULT_END_DATE);
  const [dateError, setDateError] = useState('');

  const [isFilterLoading, setIsFilterLoading] = useState(true);
  const [animateBars, setAnimateBars] = useState(false);

  // Thông báo kết quả & Modal xác nhận thao tác
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [confirmState, setConfirmState] = useState({
    open: false,
    variant: 'warning',
    title: '',
    message: '',
    detailText: '',
    detailsList: [],
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    action: null,
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardByRange = async (startDate, endDate) => {
    setIsFilterLoading(true);
    setAnimateBars(false);

    try {
      const token = localStorage.getItem('token');
      const [res] = await Promise.all([
        axios.get('/api/admin/dashboard', {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
          headers: { Authorization: `Bearer ${token}` },
        }),
        new Promise((resolve) => setTimeout(resolve, 350)),
      ]);

      setOrders(res.data.orders || []);
      setRevenues(res.data.revenues || []);
      setTopProducts(res.data.top_products || []);
      setReviews(res.data.reviews || []);
      if (res.data.books_summary) {
        setBooksSummary(res.data.books_summary);
      }

      setAppliedStartDate(startDate);
      setAppliedEndDate(endDate);

      setTimeout(() => {
        setAnimateBars(true);
      }, 40);
    } catch (err) {
      console.error('Lỗi tải dữ liệu thống kê:', err);
      setDateError('Không thể tải dữ liệu từ máy chủ. Vui lòng thử lại.');
    } finally {
      setIsFilterLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardByRange(DEFAULT_START_DATE, DEFAULT_END_DATE);
  }, []);

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setStartDateInput(newStart);

    if (newStart && endDateInput && newStart > endDateInput) {
      setDateError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
    } else {
      setDateError('');
    }
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    setEndDateInput(newEnd);

    if (startDateInput && newEnd && newEnd < startDateInput) {
      setDateError('Ngày kết thúc không được nhỏ hơn ngày bắt đầu.');
    } else {
      setDateError('');
    }
  };

  const handleApplyDateFilter = () => {
    if (!startDateInput || !endDateInput) {
      setDateError('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }

    if (startDateInput > endDateInput) {
      setDateError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
      return;
    }

    setDateError('');
    fetchDashboardByRange(startDateInput, endDateInput);
  };

  const handleResetFilter = () => {
    setDateError('');
    setStartDateInput(DEFAULT_START_DATE);
    setEndDateInput(DEFAULT_END_DATE);
    fetchDashboardByRange(DEFAULT_START_DATE, DEFAULT_END_DATE);
  };

  const isDefaultCurrentYear =
    appliedStartDate === DEFAULT_START_DATE && appliedEndDate === DEFAULT_END_DATE;

  const statusCounts = useMemo(
    () =>
      orders.reduce(
        (acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        },
        { pending: 0, processing: 0, shipping: 0, completed: 0, cancelled: 0 }
      ),
    [orders]
  );

  // Tự động gom nhóm và sinh đầy đủ từng cột theo Năm (> 366 ngày), Tháng (> 45 ngày), hoặc Ngày (<= 45 ngày)
  const { chartSeries, groupModeLabel } = useMemo(() => {
    const startMs = new Date(appliedStartDate).getTime();
    const endMs = new Date(appliedEndDate).getTime();
    const diffDays = Math.max(0, Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)));

    let mode = 'day';
    let labelText = 'Gom nhóm theo Ngày';
    if (diffDays > 366) {
      mode = 'year';
      labelText = 'Gom nhóm theo Năm';
    } else if (diffDays > 45) {
      mode = 'month';
      labelText = 'Gom nhóm theo Tháng';
    }

    const groupedMap = new Map();

    if (mode === 'year') {
      const startYear = Number(appliedStartDate.split('-')[0]);
      const endYear = Number(appliedEndDate.split('-')[0]);
      for (let y = startYear; y <= endYear; y++) {
        const key = String(y);
        groupedMap.set(key, { key, label: `Năm ${y}`, revenue: 0 });
      }
    } else if (mode === 'month') {
      let [curYear, curMonth] = appliedStartDate.split('-').map(Number);
      const [endYear, endMonth] = appliedEndDate.split('-').map(Number);

      while (curYear < endYear || (curYear === endYear && curMonth <= endMonth)) {
        const monthStr = String(curMonth).padStart(2, '0');
        const key = `${curYear}-${monthStr}`;
        groupedMap.set(key, { key, label: `${monthStr}/${curYear}`, revenue: 0 });

        curMonth++;
        if (curMonth > 12) {
          curMonth = 1;
          curYear++;
        }
      }
    } else {
      const current = new Date(`${appliedStartDate}T00:00:00`);
      const end = new Date(`${appliedEndDate}T00:00:00`);

      while (current <= end) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        groupedMap.set(key, { key, label: `${d}/${m}`, revenue: 0 });

        current.setDate(current.getDate() + 1);
      }
    }

    revenues
      .filter((item) => item.date >= appliedStartDate && item.date <= appliedEndDate)
      .forEach((item) => {
        const [year, month, day] = item.date.split('-');
        let key = item.date;
        let displayLabel = `${day}/${month}`;

        if (mode === 'year') {
          key = year;
          displayLabel = `Năm ${year}`;
        } else if (mode === 'month') {
          key = `${year}-${month}`;
          displayLabel = `${month}/${year}`;
        }

        const current = groupedMap.get(key) || { key, label: displayLabel, revenue: 0 };
        current.revenue += Number(item.revenue || 0);
        groupedMap.set(key, current);
      });

    const sortedSeries = Array.from(groupedMap.values()).sort((a, b) =>
      a.key.localeCompare(b.key)
    );

    return { chartSeries: sortedSeries, groupModeLabel: labelText };
  }, [revenues, appliedStartDate, appliedEndDate]);

  const totalPeriodRevenue = useMemo(
    () => chartSeries.reduce((sum, item) => sum + Number(item.revenue || 0), 0),
    [chartSeries]
  );

  const maxRevenue = useMemo(
    () => Math.max(...chartSeries.map((item) => Number(item.revenue || 0)), 1),
    [chartSeries]
  );

  const filteredTableOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((order) => order.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Gọi Modal thông báo xác nhận trước khi Ẩn / Hiển thị đánh giá
  const handleToggleReviewVisibility = (review) => {
    const isHiding = review.status === 'visible';
    const nextActionText = isHiding ? 'Ẩn' : 'Hiển thị';

    setConfirmState({
      open: true,
      variant: 'warning',
      title: `Xác nhận ${nextActionText.toLowerCase()} đánh giá`,
      message: `Bạn có chắc chắn muốn ${nextActionText.toLowerCase()} nhận xét của khách hàng "${review.customer}" trên trang sản phẩm?`,
      detailText: '',
      detailsList: [
        { label: 'Khách hàng', value: review.customer },
        { label: 'Sản phẩm', value: review.book },
        { label: 'Mức đánh giá', value: `${review.rating} / 5 sao` },
      ],
      confirmText: `Xác nhận ${nextActionText}`,
      cancelText: 'Hủy',
      action: async () => {
        setActionLoading(true);
        setActionMsg({ type: '', text: '' });
        try {
          const token = localStorage.getItem('token');
          const res = await axios.patch(
            `/api/admin/reviews/${review.id}/toggle`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setReviews((prev) =>
            prev.map((item) =>
              item.id === review.id ? { ...item, status: res.data.status } : item
            )
          );
          setActionMsg({
            type: 'success',
            text: `Đã ${nextActionText.toLowerCase()} đánh giá của khách hàng "${review.customer}".`,
          });
        } catch {
          setActionMsg({
            type: 'error',
            text: 'Không thể cập nhật trạng thái đánh giá!',
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  // Gọi Modal thông báo xác nhận trước khi Xóa đánh giá
  const handleDeleteReview = (review) => {
    setConfirmState({
      open: true,
      variant: 'danger',
      title: 'Xác nhận xóa đánh giá',
      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này khỏi cơ sở dữ liệu? Thao tác này không thể hoàn tác.',
      detailText: '',
      detailsList: [
        { label: 'Khách hàng', value: review.customer },
        { label: 'Sản phẩm', value: review.book },
        { label: 'Mức đánh giá', value: `${review.rating} / 5 sao` },
      ],
      confirmText: 'Xóa đánh giá',
      cancelText: 'Hủy',
      action: async () => {
        setActionLoading(true);
        setActionMsg({ type: '', text: '' });
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/admin/reviews/${review.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setReviews((prev) => prev.filter((item) => item.id !== review.id));
          setActionMsg({
            type: 'success',
            text: `Đã xóa đánh giá của khách hàng "${review.customer}".`,
          });
        } catch {
          setActionMsg({
            type: 'error',
            text: 'Không thể xóa đánh giá!',
          });
        } finally {
          setActionLoading(false);
          setConfirmState((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const filteredReviews = useMemo(() => {
    if (ratingFilter === 'all') return reviews;
    if (ratingFilter === 'low') return reviews.filter((r) => Number(r.rating) <= 3);
    return reviews.filter((r) => Number(r.rating) === Number(ratingFilter));
  }, [reviews, ratingFilter]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '0.0';
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // 4 trạng thái chính hiển thị thanh tiến trình tổng quan
  const overviewStatusKeys = ['pending', 'shipping', 'completed', 'cancelled'];

  return (
    <div className="space-y-6">
      {actionMsg.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-2 ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{actionMsg.text}</span>
          <button
            type="button"
            onClick={() => setActionMsg({ type: '', text: '' })}
            className="text-xs font-bold opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 4 Thẻ chỉ số tổng quan (KPI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {isDefaultCurrentYear ? 'Doanh thu năm nay' : 'Doanh thu kỳ đã lọc'}
          </div>
          {isFilterLoading ? (
            <div className="mt-2 space-y-2 animate-pulse">
              <div className="h-8 w-36 bg-stone-200 rounded-lg" />
              <div className="h-3.5 w-44 bg-stone-100 rounded" />
            </div>
          ) : (
            <>
              <div className="mt-2 text-2xl font-bold text-[#1A1A1A]">
                {formatVND(totalPeriodRevenue)}
              </div>
              <div className="mt-1.5 text-xs text-emerald-700 font-medium">
                {formatFullDate(appliedStartDate)} – {formatFullDate(appliedEndDate)}
              </div>
            </>
          )}
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Tổng đơn hàng
          </div>
          {isFilterLoading ? (
            <div className="mt-2 space-y-2 animate-pulse">
              <div className="h-8 w-28 bg-stone-200 rounded-lg" />
              <div className="h-3.5 w-40 bg-stone-100 rounded" />
            </div>
          ) : (
            <>
              <div className="mt-2 text-2xl font-bold text-[#1A1A1A]">{orders.length} đơn</div>
              <div className="mt-1.5 text-xs text-stone-600">
                <span className="text-emerald-700 font-semibold">
                  {statusCounts.completed} hoàn thành
                </span>{' '}
                ·{' '}
                <span className="text-rose-600 font-semibold">
                  {statusCounts.cancelled} đã hủy
                </span>
              </div>
            </>
          )}
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Tổng đầu sách
          </div>
          {isFilterLoading ? (
            <div className="mt-2 space-y-2 animate-pulse">
              <div className="h-8 w-32 bg-stone-200 rounded-lg" />
              <div className="h-3.5 w-36 bg-stone-100 rounded" />
            </div>
          ) : (
            <>
              <div className="mt-2 text-2xl font-bold text-[#1A1A1A]">
                {booksSummary.total} đầu sách
              </div>
              <div className="mt-1.5 text-xs text-stone-600">
                <span className="text-amber-700 font-semibold">
                  {booksSummary.low_stock} sắp hết
                </span>{' '}
                ·{' '}
                <span className="text-rose-600 font-semibold">
                  {booksSummary.out_of_stock} hết hàng
                </span>
              </div>
            </>
          )}
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Đánh giá trung bình
          </div>
          {isFilterLoading ? (
            <div className="mt-2 space-y-2 animate-pulse">
              <div className="h-8 w-24 bg-stone-200 rounded-lg" />
              <div className="h-3.5 w-40 bg-stone-100 rounded" />
            </div>
          ) : (
            <>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#1A1A1A]">{averageRating} / 5</span>
                <span className="text-amber-500 text-base">★</span>
              </div>
              <div className="mt-1.5 text-xs text-stone-600">
                Tổng cộng{' '}
                <span className="font-semibold text-[#1A1A1A]">{reviews.length} lượt đánh giá</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Biểu đồ doanh thu theo lịch & Phân bổ trạng thái đơn hàng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm overflow-hidden">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Biểu đồ thống kê doanh thu
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Đơn vị: VNĐ — Chỉ tổng hợp đơn hàng Đã hoàn thành ({groupModeLabel})
              </p>
            </div>

            {/* Bộ chọn lịch Từ ngày - Đến ngày + Nút Phễu lọc + Nút Năm nay */}
            <div className="flex flex-col items-start xl:items-end gap-1.5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#FAF8F5] border border-stone-200 rounded-xl px-2.5 py-1.5">
                  <span className="text-xs font-medium text-stone-500">Từ:</span>
                  <input
                    type="date"
                    value={startDateInput}
                    max={endDateInput}
                    onChange={handleStartDateChange}
                    className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1 bg-[#FAF8F5] border border-stone-200 rounded-xl px-2.5 py-1.5">
                  <span className="text-xs font-medium text-stone-500">Đến:</span>
                  <input
                    type="date"
                    value={endDateInput}
                    min={startDateInput}
                    onChange={handleEndDateChange}
                    className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleApplyDateFilter}
                  disabled={isFilterLoading}
                  title="Lọc toàn bộ thống kê theo khoảng thời gian"
                  aria-label="Lọc thống kê"
                  className="p-2 rounded-xl bg-[#9A5B13] text-white hover:bg-[#7d490e] disabled:opacity-60 transition shadow-sm cursor-pointer flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>

                {!isDefaultCurrentYear && (
                  <button
                    type="button"
                    onClick={handleResetFilter}
                    disabled={isFilterLoading}
                    title="Quay về thống kê năm nay (2026)"
                    className="px-2.5 py-2 rounded-xl border border-stone-200 bg-[#FAF8F5] text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-60 transition cursor-pointer whitespace-nowrap"
                  >
                    Năm nay
                  </button>
                )}
              </div>

              {dateError && (
                <span className="text-xs font-medium text-rose-600">{dateError}</span>
              )}
            </div>
          </div>

          {isFilterLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 border border-stone-100 rounded-xl bg-[#FAF8F5]/60">
              <div className="w-7 h-7 border-[3px] border-stone-200 border-t-[#9A5B13] rounded-full animate-spin" />
              <span className="text-xs font-medium text-stone-500">
                Đang tải dữ liệu thống kê...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto pb-1">
              <div className="flex items-end min-w-full w-max">
                {chartSeries.map((item) => {
                  const hasRevenue = Number(item.revenue || 0) > 0;
                  const targetHeight = hasRevenue
                    ? Math.max(Math.round((item.revenue / maxRevenue) * 100), 6)
                    : 0;
                  return (
                    <div
                      key={item.key}
                      className="flex-1 min-w-[54px] px-1 flex flex-col items-center group"
                    >
                      <div className="h-52 w-full flex flex-col items-center justify-end border-b border-stone-200">
                        <span
                          className={`text-[11px] font-semibold mb-1.5 whitespace-nowrap ${
                            hasRevenue ? 'text-stone-700' : 'text-stone-400'
                          }`}
                        >
                          {!hasRevenue
                            ? '0đ'
                            : item.revenue >= 1000000
                              ? (item.revenue / 1000000).toFixed(2) + ' tr'
                              : (item.revenue / 1000).toLocaleString('vi-VN') + 'k'}
                        </span>
                        <div
                          style={{ height: animateBars ? `${targetHeight}%` : '0%' }}
                          title={`${item.label}: ${formatVND(item.revenue)}`}
                          className={`w-7 sm:w-8 rounded-t-lg transition-all duration-500 ease-out ${
                            hasRevenue
                              ? 'bg-[#9A5B13] hover:bg-[#7d490e]'
                              : 'bg-stone-200 min-h-[3px]'
                          }`}
                        />
                      </div>
                      <span className="mt-2.5 text-[11px] font-semibold text-stone-600 whitespace-nowrap">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Phân bổ trạng thái đơn */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Trạng thái đơn hàng
            </h2>
            <p className="text-xs text-stone-500 mt-0.5 mb-5">
              Kỳ {formatFullDate(appliedStartDate)} – {formatFullDate(appliedEndDate)}
            </p>

            {isFilterLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-3.5 w-24 bg-stone-200 rounded" />
                      <div className="h-3.5 w-16 bg-stone-200 rounded" />
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {overviewStatusKeys.map((key) => {
                  const meta = STATUS_META[key];
                  const count = statusCounts[key] || 0;
                  const percent = orders.length
                    ? Math.round((count / orders.length) * 100)
                    : 0;
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
                          className={`h-full rounded-full transition-all duration-500 ${meta.bar}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-500 leading-relaxed">
            Doanh thu chỉ ghi nhận từ các đơn ở trạng thái{' '}
            <strong className="text-emerald-700">Đã hoàn thành</strong>.
          </div>
        </div>
      </div>

      {/* Top 5 sản phẩm bán chạy & Bảng Danh sách đơn hàng */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
            Top 5 sách bán chạy
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 mb-4">
            Kỳ {formatFullDate(appliedStartDate)} – {formatFullDate(appliedEndDate)}
          </p>

          {isFilterLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4, 5].map((idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 rounded-full bg-stone-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-3/4 bg-stone-200 rounded" />
                      <div className="h-3 w-1/2 bg-stone-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1.5 w-16">
                    <div className="h-4 w-full bg-stone-200 rounded" />
                    <div className="h-3 w-full bg-stone-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Không có dữ liệu sách bán chạy trong khoảng thời gian này.
            </div>
          ) : (
            <div className="divide-y divide-stone-100">
              {topProducts.map((book) => (
                <div key={book.id} className="py-3 flex items-center justify-between gap-3">
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
                        <span className={Number(book.stock) <= 1 ? 'text-rose-600 font-semibold' : ''}>
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
          )}
        </div>

        {/* Bảng Danh sách đơn hàng */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
                Danh sách đơn hàng
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Toàn bộ đơn hàng trong kỳ {formatFullDate(appliedStartDate)} – {formatFullDate(appliedEndDate)}
              </p>
            </div>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              disabled={isFilterLoading}
              className="text-xs font-semibold border border-stone-200 rounded-xl px-3 py-2 bg-[#FAF8F5] text-stone-700 disabled:opacity-60 focus:outline-none focus:border-[#9A5B13]"
            >
              <option value="all">Tất cả trạng thái ({orders.length})</option>
              <option value="pending">Chờ xác nhận ({statusCounts.pending})</option>
              <option value="shipping">Đang giao ({statusCounts.shipping})</option>
              <option value="completed">Đã hoàn thành ({statusCounts.completed})</option>
              <option value="cancelled">Đã hủy ({statusCounts.cancelled})</option>
            </select>
          </div>

          <div className="overflow-x-auto overflow-y-auto max-h-96">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_#e7e5e4]">
                <tr className="text-[11px] uppercase text-stone-500">
                  <th className="py-2.5 pr-2">Mã đơn</th>
                  <th className="py-2.5 px-2">Người nhận</th>
                  <th className="py-2.5 px-2">Tổng tiền</th>
                  <th className="py-2.5 px-2">Ngày đặt</th>
                  <th className="py-2.5 pl-2 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isFilterLoading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-stone-500">
                      <div className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-stone-200 border-t-[#9A5B13] rounded-full animate-spin" />
                        Đang tải danh sách đơn hàng theo kỳ...
                      </div>
                    </td>
                  </tr>
                ) : filteredTableOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-stone-400">
                      Không có đơn hàng nào khớp với bộ lọc đã chọn.
                    </td>
                  </tr>
                ) : (
                  filteredTableOrders.map((order) => {
                    const meta = STATUS_META[order.status] || {
                      label: order.status,
                      badge: 'bg-stone-100 text-stone-700',
                    };
                    return (
                      <tr key={order.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-2.5 pr-2 font-semibold text-xs text-[#1A1A1A] whitespace-nowrap">
                          #DH{String(order.id).padStart(4, '0')}
                        </td>
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <div className="font-medium text-xs text-stone-800">{order.receiver}</div>
                          <div className="text-[11px] text-stone-500">
                            {order.phone} · {order.method}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-semibold text-xs text-[#1A1A1A] whitespace-nowrap">
                          {formatVND(order.total)}
                        </td>
                        <td className="py-2.5 px-2 text-xs text-stone-600 whitespace-nowrap">
                          {formatFullDate(order.created_at)}
                        </td>
                        <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${meta.badge}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bảng đánh giá khách hàng */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#1A1A1A]">
              Đánh giá sản phẩm theo kỳ
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Kiểm duyệt nhận xét và mức độ hài lòng của khách hàng sau khi mua sách
            </p>
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            disabled={isFilterLoading}
            className="text-xs font-semibold border border-stone-200 rounded-xl px-3 py-2 bg-[#FAF8F5] text-stone-700 disabled:opacity-60 focus:outline-none focus:border-[#9A5B13]"
          >
            <option value="all">Tất cả số sao ({reviews.length})</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="low">Từ 3 sao trở xuống</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase text-stone-500">
                <th className="py-2.5 pr-3">Khách hàng</th>
                <th className="py-2.5 px-3">Sản phẩm</th>
                <th className="py-2.5 px-3">Đánh giá</th>
                <th className="py-2.5 px-3">Nội dung nhận xét</th>
                <th className="py-2.5 px-3">Trạng thái</th>
                <th className="py-2.5 pl-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isFilterLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-xs text-stone-500">
                    <div className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-stone-200 border-t-[#9A5B13] rounded-full animate-spin" />
                      Đang tải danh sách đánh giá theo kỳ...
                    </div>
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-stone-400">
                    Không có đánh giá nào khớp với khoảng thời gian và bộ lọc đã chọn.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3.5 pr-3 whitespace-nowrap">
                      <div className="font-semibold text-[#1A1A1A]">{review.customer}</div>
                      <div className="text-xs text-stone-500">{review.created_at}</div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-stone-800 max-w-[180px] truncate">
                      {review.book}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StarRating rating={Number(review.rating)} />
                    </td>
                    <td className="py-3.5 px-3 text-stone-600 max-w-md">
                      <p className="line-clamp-2 leading-relaxed">{review.comment}</p>
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {review.status === 'visible' ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Hiển thị
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-200 text-stone-700">
                          Đang ẩn
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleReviewVisibility(review)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                      >
                        {review.status === 'visible' ? 'Ẩn' : 'Hiện'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition ml-1 cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal thông báo xác nhận ẩn/hiện hoặc xóa đánh giá */}
      <AdminConfirmModal
        open={confirmState.open}
        variant={confirmState.variant}
        title={confirmState.title}
        message={confirmState.message}
        detailText={confirmState.detailText}
        detailsList={confirmState.detailsList}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        loading={actionLoading}
        onConfirm={() => confirmState.action?.()}
        onCancel={() =>
          !actionLoading &&
          setConfirmState((prev) => ({ ...prev, open: false }))
        }
      />
    </div>
  );
}