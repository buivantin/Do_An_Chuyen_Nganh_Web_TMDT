// Dữ liệu giả dự phòng để test FE khi Backend chưa mở API /api/products
const FALLBACK_BOOKS = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  title: [
    'Cây Cam Ngọt Của Tôi',
    'Nhà Giả Kim',
    'Đắc Nhân Tâm',
    'Tuổi Trẻ Đáng Giá Bao Nhiêu',
    'Tư Duy Nhanh Và Chậm',
    'Hoàng Tử Bé',
    'Muôn Kiếp Nhân Sinh',
    'Chiến Binh Cầu Vồng',
  ][i % 8] + ` (Tập ${Math.floor(i / 8) + 1})`,
  author: ['José Mauro de Vasconcelos', 'Paulo Coelho', 'Dale Carnegie', 'Rosie Nguyễn', 'Daniel Kahneman'][i % 5],
  category_id: (i % 5) + 1,
  category: ['Văn học', 'Kinh tế', 'Kỹ năng sống', 'CNTT & Lập trình', 'Ngoại ngữ'][i % 5],
  rating: (4.5 + (i % 5) * 0.1).toFixed(1),
  price: 65000 + (i % 6) * 35000,
  image: 'https://salt.tikicdn.com/cache/w1200/ts/product/22/cb/a9/524a27dcd45e8a13ae6eecb3dfacba7c.jpg',
}));

const ProductService = {
  async search(keyword = '', categoryId = '', minPrice = '', maxPrice = '', sort = 'newest', page = 1) {
    const params = new URLSearchParams();

    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (categoryId) params.set('category_id', categoryId);
    if (minPrice !== '' && minPrice !== null) params.set('min_price', minPrice);
    if (maxPrice !== '' && maxPrice !== null) params.set('max_price', maxPrice);
    if (sort) params.set('sort', sort);
    params.set('page', page);
    params.set('per_page', 12);

    try {
      const response = await fetch(`/api/products?${params.toString()}`, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('API chưa sẵn sàng');

      const result = await response.json();
      // Chuẩn hóa dữ liệu trả về từ Laravel Paginator (result.data & result.meta hoặc root)
      const rawList = Array.isArray(result.data) ? result.data : [];
      const items = rawList.map((item) => ({
        id: item.id,
        title: item.title || item.name,
        author: item.author || 'Đang cập nhật',
        category: item.category?.name || item.category_name || 'Sách',
        rating: item.rating || 4.8,
        price: Number(item.price),
        image: item.image || item.thumbnail,
      }));

      return {
        items,
        currentPage: result.current_page || result.meta?.current_page || page,
        lastPage: result.last_page || result.meta?.last_page || 1,
        total: result.total || result.meta?.total || items.length,
      };
    } catch {
      // Fallback lọc & phân trang phía client để test UI khi chưa có Backend
      let filtered = [...FALLBACK_BOOKS];

      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        filtered = filtered.filter(
          (b) => b.title.toLowerCase().includes(kw) || b.author.toLowerCase().includes(kw)
        );
      }
      if (categoryId) {
        filtered = filtered.filter((b) => String(b.category_id) === String(categoryId));
      }
      if (minPrice !== '') {
        filtered = filtered.filter((b) => b.price >= Number(minPrice));
      }
      if (maxPrice !== '') {
        filtered = filtered.filter((b) => b.price <= Number(maxPrice));
      }

      if (sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
      if (sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);

      const perPage = 12;
      const total = filtered.length;
      const lastPage = Math.max(1, Math.ceil(total / perPage));
      const safePage = Math.min(Math.max(1, Number(page)), lastPage);
      const start = (safePage - 1) * perPage;

      return {
        items: filtered.slice(start, start + perPage),
        currentPage: safePage,
        lastPage,
        total,
      };
    }
  },
};

export default ProductService;