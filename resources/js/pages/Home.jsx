import React from 'react';
import MainLayout from '../layouts/MainLayout';
import ProductCard from '../components/ProductCard';

const MOCK_BOOKS = [
  {
    id: 1,
    title: 'Cây Cam Ngọt Của Tôi',
    author: 'José Mauro de Vasconcelos',
    category: 'VĂN HỌC KINH ĐIỂN',
    rating: 4.9,
    price: 81000,
    image: 'https://salt.tikicdn.com/cache/w1200/ts/product/22/cb/a9/524a27dcd45e8a13ae6eecb3dfacba7c.jpg',
  },
  {
    id: 1,
    title: 'Cây Cam Ngọt Của Tôi',
    author: 'José Mauro de Vasconcelos',
    category: 'VĂN HỌC KINH ĐIỂN',
    rating: 4.9,
    price: 81000,
    image: 'https://salt.tikicdn.com/cache/w1200/ts/product/22/cb/a9/524a27dcd45e8a13ae6eecb3dfacba7c.jpg',
  },
  {
    id: 1,
    title: 'Cây Cam Ngọt Của Tôi',
    author: 'José Mauro de Vasconcelos',
    category: 'VĂN HỌC KINH ĐIỂN',
    rating: 4.9,
    price: 81000,
    image: 'https://salt.tikicdn.com/cache/w1200/ts/product/22/cb/a9/524a27dcd45e8a13ae6eecb3dfacba7c.jpg',
  },
  {
    id: 1,
    title: 'Cây Cam Ngọt Của Tôi',
    author: 'José Mauro de Vasconcelos',
    category: 'VĂN HỌC KINH ĐIỂN',
    rating: 4.9,
    price: 81000,
    image: 'https://salt.tikicdn.com/cache/w1200/ts/product/22/cb/a9/524a27dcd45e8a13ae6eecb3dfacba7c.jpg',
  },
  {
    id: 1,
    title: 'Cây Cam Ngọt Của Tôi',
    author: 'José Mauro de Vasconcelos',
    category: 'VĂN HỌC KINH ĐIỂN',
    rating: 4.9,
    price: 81000,
    image: 'https://salt.tikicdn.com/cache/w1200/ts/product/22/cb/a9/524a27dcd45e8a13ae6eecb3dfacba7c.jpg',
  },
];

export default function Home() {
  const handleAddToCart = (book) => {
    alert(`Đã thêm "${book.title}" vào giỏ!`);
  };

  return (
    <MainLayout>
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Sách mới</h2>
        <div className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {MOCK_BOOKS.map((item) => (
            <ProductCard key={item.id} book={item} onAddToCart={handleAddToCart} />
          ))}
        </div>
      </section>
    </MainLayout>
  );
}