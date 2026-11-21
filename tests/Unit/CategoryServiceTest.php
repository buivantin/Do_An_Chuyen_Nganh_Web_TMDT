<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Product;
use App\Services\CategoryService;
use Exception;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CategoryService $categoryService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->categoryService = new CategoryService();
    }

    /**
     * Test case 1: Không cho phép xóa danh mục đang có sản phẩm
     */
    public function test_cannot_delete_category_that_has_products(): void
    {
        // 1. Tạo 1 danh mục và 1 sản phẩm thuộc danh mục đó
        $category = Category::create([
            'name'        => 'Văn học Việt Nam',
            'description' => 'Danh mục test có sản phẩm',
            'status'      => 'active',
        ]);

        Product::create([
            'name'        => 'Mắt Biếc',
            'author'      => 'Nguyễn Nhật Ánh',
            'price'       => 110000,
            'stock'       => 10,
            'category_id' => $category->id,
            'status'      => 'active',
        ]);

        // 2. Kỳ vọng hệ thống ném Exception đúng thông báo của CategoryService
        $this->expectException(Exception::class);
        $this->expectExceptionMessage(
            'Không thể xóa danh mục "Văn học Việt Nam" vì đang có 1 sản phẩm thuộc danh mục này.'
        );

        try {
            $this->categoryService->delete($category->id);
        } finally {
            // 3. Xác nhận danh mục vẫn còn nguyên trong CSDL
            $this->assertDatabaseHas('categories', [
                'id'   => $category->id,
                'name' => 'Văn học Việt Nam',
            ]);
        }
    }

    /**
     * Test case 2: Xóa thành công danh mục không có sản phẩm nào
     */
    public function test_can_delete_empty_category(): void
    {
        $category = Category::create([
            'name'        => 'Danh mục rỗng',
            'description' => 'Không có sản phẩm trực thuộc',
            'status'      => 'active',
        ]);

        $result = $this->categoryService->delete($category->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('categories', [
            'id' => $category->id,
        ]);
    }
}