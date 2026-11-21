import axios from 'axios';

const ProductService = {
  async getCategories() {
    const { data } = await axios.get('/api/categories', {
      headers: { Accept: 'application/json' },
    });
    const list = Array.isArray(data) ? data : data.data || [];
    return list.filter((cat) => !cat.status || cat.status === 'active');
  },

  async search(keyword = '', categoryId = '', minPrice = '', maxPrice = '', sort = 'bestseller', page = 1) {
    const params = {
      page: Number(page) || 1,
      per_page: 12,
    };

    if (keyword && keyword.trim()) params.keyword = keyword.trim();
    if (categoryId) params.category_id = categoryId;
    if (minPrice !== '' && minPrice !== null) params.min_price = Number(minPrice);
    if (maxPrice !== '' && maxPrice !== null) params.max_price = Number(maxPrice);
    if (sort) params.sort = sort;

    const { data } = await axios.get('/api/products', {
      params,
      headers: { Accept: 'application/json' },
    });

    const rawList = Array.isArray(data.data) ? data.data : [];

    const items = rawList.map((item) => ({
      id: item.id,
      title: item.title || item.name || '',
      author: item.author || 'Đang cập nhật',
      category:
        typeof item.category === 'object' && item.category !== null
          ? item.category.name
          : item.category || item.category_name || '',
      category_id: item.category_id ?? item.category?.id ?? null,
      price: Number(item.price || 0),
      image: item.image || item.thumbnail || '',
    }));

    return {
      items,
      currentPage: data.current_page || data.meta?.current_page || params.page,
      lastPage: data.last_page || data.meta?.last_page || 1,
      total: data.total || data.meta?.total || items.length,
    };
  },
  // Thêm vào object ProductService trong resources/js/services/ProductService.js
  async getById(id) {
    const { data } = await axios.get(`/api/products/${id}`, {
      headers: { Accept: 'application/json' },
    });

    const item = data.data || data;
    return {
      id: item.id,
      title: item.title || item.name || '',
      author: item.author || 'Đang cập nhật',
      description: item.description || '',
      stock: Number(item.stock ?? 0),
      price: Number(item.price || 0),
      image: item.image || item.thumbnail || '',
      category_id: item.category_id ?? item.category?.id ?? null,
      category:
        typeof item.category === 'object' && item.category !== null
          ? item.category.name
          : item.category || item.category_name || 'Sách',
    };
  },

  async addToCart(productId, quantity = 1) {
    const token = localStorage.getItem('token');
    const { data } = await axios.post(
      '/api/cart/add',
      { product_id: productId, quantity },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );
    return data;
  },
};


export default ProductService;