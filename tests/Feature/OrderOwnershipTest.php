<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderOwnershipTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $email): User
    {
        $id = DB::table('users')->insertGetId([
            'username'   => $email,
            'email'      => $email,
            'password'   => bcrypt('12345678'),
            'role'       => 'customer',
            'status'     => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return User::find($id);
    }

    private function makeOrder(int $userId): int
    {
        return DB::table('orders')->insertGetId([
            'user_id'        => $userId,
            'receiver_name'  => 'A',
            'phone'          => '0901234567',
            'address'        => 'x',
            'status'         => 'pending',
            'payment_method' => 'cod',
            'total_amount'   => 100000,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);
    }

    public function test_chua_dang_nhap_bi_chan(): void
    {
        $this->getJson('/api/orders/1')->assertStatus(401);
        $this->getJson('/api/orders')->assertStatus(401);
    }

    public function test_xem_duoc_don_cua_chinh_minh(): void
    {
        $a = $this->makeUser('a@test.com');
        $orderId = $this->makeOrder($a->id);

        Sanctum::actingAs($a);

        $response = $this->getJson("/api/orders/$orderId")
            ->assertStatus(200);

        $actualId = $response->json('data.id')
            ?? $response->json('order.id')
            ?? $response->json('id');

        $this->assertNotNull($actualId);
        $this->assertSame($orderId, (int) $actualId);
    }

    public function test_doi_id_tren_url_sang_don_nguoi_khac_bi_chan(): void
    {
        $a = $this->makeUser('a@test.com');
        $b = $this->makeUser('b@test.com');
        $orderOfA = $this->makeOrder($a->id);

        Sanctum::actingAs($b);

        $this->getJson("/api/orders/$orderOfA")->assertStatus(404);
    }

    public function test_danh_sach_chi_chua_don_cua_minh(): void
    {
        $a = $this->makeUser('a@test.com');
        $b = $this->makeUser('b@test.com');
        $this->makeOrder($a->id);
        $this->makeOrder($a->id);
        $this->makeOrder($b->id);

        Sanctum::actingAs($a);

        $response = $this->getJson('/api/orders')->assertStatus(200);

        $total = $response->json('data.total')
            ?? $response->json('orders.total')
            ?? $response->json('total');

        if ($total !== null) {
            $this->assertSame(2, (int) $total);
        } else {
            $items = $response->json('data')
                ?? $response->json('orders')
                ?? $response->json();

            $this->assertIsArray($items);
            $this->assertCount(2, $items);
        }
    }
}