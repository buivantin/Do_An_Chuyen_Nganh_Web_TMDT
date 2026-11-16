<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;

class RegisterController extends Controller
{
    public function __construct(private AuthService $auth)
    {
    }

    public function store(RegisterRequest $request)
    {
        $user = $this->auth->register($request->validated());

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user'    => $user,
        ], 201);
    }
}