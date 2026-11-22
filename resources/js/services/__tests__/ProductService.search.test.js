import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import ProductService from "../ProductService";

vi.mock("axios");

function extractBooks(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.products?.data)) return result.products.data;
  if (Array.isArray(result?.products)) return result.products;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

describe("ProductService.search - Lọc theo khoảng giá", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gửi đúng min_price, max_price và trả về các sách nằm trong khoảng giá", async () => {
    const mockBooksInRange = [
      { id: 1, name: "Nhà Giả Kim", price: 79000 },
      { id: 2, name: "Đắc Nhân Tâm", price: 120000 },
    ];

    axios.get.mockResolvedValueOnce({
      data: {
        products: {
          data: mockBooksInRange,
          current_page: 1,
          last_page: 1,
          total: 2,
        },
        data: mockBooksInRange,
      },
    });

    const result = await ProductService.search("", null, 50000, 150000);

    expect(axios.get).toHaveBeenCalledTimes(1);
    const [calledUrl, calledConfig] = axios.get.mock.calls[0];
    expect(calledUrl).toContain("/api/products");
    expect(calledConfig.params).toMatchObject({
      min_price: 50000,
      max_price: 150000,
    });

    const items = extractBooks(result);
    expect(items).toHaveLength(2);
    items.forEach((book) => {
      expect(book.price).toBeGreaterThanOrEqual(50000);
      expect(book.price).toBeLessThanOrEqual(150000);
    });
  });

  it("kết hợp lọc khoảng giá với từ khóa tìm kiếm (keyword)", async () => {
    const mockFiltered = [
      { id: 5, name: "Quản Trị Nhân Sự 4.0", price: 183000 },
    ];

    axios.get.mockResolvedValueOnce({
      data: {
        products: {
          data: mockFiltered,
          current_page: 1,
          last_page: 1,
          total: 1,
        },
        data: mockFiltered,
      },
    });

    const result = await ProductService.search("Quản Trị", null, 100000, 250000);

    const [, calledConfig] = axios.get.mock.calls[0];
    expect(calledConfig.params).toMatchObject({
      keyword: "Quản Trị",
      min_price: 100000,
      max_price: 250000,
    });

    const items = extractBooks(result);
    expect(items).toHaveLength(1);
    const bookTitle = items[0].title ?? items[0].name;
    expect(bookTitle).toContain("Quản Trị");
    expect(items[0].price).toBe(183000);
  });

  it("trả về danh sách rỗng khi không có sách nào trong khoảng giá", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        products: {
          data: [],
          current_page: 1,
          last_page: 1,
          total: 0,
        },
        data: [],
      },
    });

    const result = await ProductService.search("", null, 5000000, 10000000);

    const items = extractBooks(result);
    expect(items).toEqual([]);
  });
});