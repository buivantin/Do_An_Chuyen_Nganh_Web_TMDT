<?php

namespace Tests\Feature;

use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_service_can_paginate()
    {
        $service = new UserService();
        $users = $service->list(null, 10);
        
        $this->assertEquals(10, $users->perPage());
    }
}