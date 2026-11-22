<?php

namespace Tests\Unit;

use App\Services\AuthService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    private AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = app(AuthService::class);
    }

    public function test_dang_ky_email_trung_bi_tu_choi(): void
    {
        DB::table('users')->insert([
            'username'   => 'user_test_1',
            'email'      => 'trungemail@gmail.com',
            'password'   => bcrypt('12345678'),
            'role'       => 'customer',
            'status'     => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->expectException(ValidationException::class);

        $this->authService->register([
            'username' => 'user_test_2',
            'email'    => 'trungemail@gmail.com',
            'password' => '12345678',
        ]);
    }

    public function test_dang_nhap_tai_khoan_bi_khoa_bi_tu_choi(): void
    {
        DB::table('users')->insert([
            'username'   => 'user_bi_khoa',
            'email'      => 'locked@gmail.com',
            'password'   => bcrypt('12345678'),
            'role'       => 'customer',
            'status'     => 'locked',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->expectException(ValidationException::class);

        $this->authService->login('locked@gmail.com', '12345678');
    }
}