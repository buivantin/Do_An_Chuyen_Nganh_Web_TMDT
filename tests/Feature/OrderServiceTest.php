<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class OrderServiceTest extends TestCase
{
    use RefreshDatabase;

    private OrderService $service;
    private int $userId;
    private int $categoryId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = app(OrderService::class);

        $this->userId = DB::table('users')->insertGetId([
            'username'   => 'khach test',
            'email'      => 'khach@test.com',
            'password'   => bcrypt('12345678'),
            'role'       => 'customer',
            'status'     => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->categoryId = DB::table('categories')->insertGetId([
            'name'       => 'Van hoc',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    protected function tearDown(): void
    {
        OrderItem::flushEventListeners(); // gỡ listener giả lập lỗi
        parent::tearDown();
    }

    private function makeProduct(string $name, int $price, int $stock): int
    {
        return DB::table('products')->insertGetId([
            'name'        => $name,
            'price'       => $price,
            'stock'       => $stock,
            'status'      => 'active',
            'category_id' => $this->categoryId,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);
    }

    private function addToCart(int $productId, int $qty): void
    {
        DB::table('cart_items')->insert([
            'user_id'    => $this->userId,
            'product_id' => $productId,
            'quantity'   => $qty,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function orderData(): array
    {
        return [
            'receiver_name' => 'Nguyen Van A',
            'phone'         => '0901234567',
            'address'       => '12 Le Loi, Q1',
        ];
    }

    private function stockOf(int $productId): int
    {
        return (int) DB::table('products')->where('id', $productId)->value('stock');
    }

    public function test_dat_hang_thanh_cong(): void
    {
        $productId = $this->makeProduct('Sach A', 100000, 5);
        $this->addToCart($productId, 2);

        $order = $this->service->placeOrder($this->userId, $this->orderData());

        $this->assertSame('pending', $order->status);
        $this->assertSame('cod', $order->payment_method);
        $this->assertEquals(200000, $order->total_amount);

        $this->assertSame(1, OrderItem::where('order_id', $order->id)->count());
        $item = OrderItem::where('order_id', $order->id)->first();
        $this->assertEquals(100000, $item->price);     // giá tại lúc mua
        $this->assertSame(2, (int) $item->quantity);

        $this->assertSame(3, $this->stockOf($productId)); // kho 5 trừ 2
        $this->assertSame(0, DB::table('cart_items')->where('user_id', $this->userId)->count());
    }

    public function test_dat_hang_vuot_ton_kho_bi_tu_choi(): void
    {
        $productId = $this->makeProduct('Sach A', 100000, 1);
        $this->addToCart($productId, 3);

        try {
            $this->service->placeOrder($this->userId, $this->orderData());
            $this->fail('Phải ném ValidationException khi vượt tồn kho.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('cart', $e->errors());
        }

        $this->assertSame(0, Order::count());
        $this->assertSame(1, $this->stockOf($productId));  // kho không đổi, không âm
        $this->assertSame(1, DB::table('cart_items')->where('user_id', $this->userId)->count());
    }

    public function test_loi_giua_chung_thi_rollback_toan_bo(): void
    {
        $p1 = $this->makeProduct('Sach A', 100000, 5);
        $p2 = $this->makeProduct('Sach B', 50000, 5);
        $this->addToCart($p1, 2);
        $this->addToCart($p2, 2);

        // Giả lập lỗi sau khi đơn và dòng chi tiết đầu tiên đã được tạo
        $n = 0;
        OrderItem::created(function () use (&$n) {
            if (++$n === 2) {
                throw new \RuntimeException('Loi gia lap');
            }
        });

        try {
            $this->service->placeOrder($this->userId, $this->orderData());
            $this->fail('Phải ném RuntimeException.');
        } catch (\RuntimeException $e) {
            // mong đợi
        }

        $this->assertSame(0, Order::count());
        $this->assertSame(0, OrderItem::count());
        $this->assertSame(5, $this->stockOf($p1));   // Sách A đã bị trừ rồi được hoàn lại
        $this->assertSame(5, $this->stockOf($p2));
        $this->assertSame(2, DB::table('cart_items')->where('user_id', $this->userId)->count());
    }
}
