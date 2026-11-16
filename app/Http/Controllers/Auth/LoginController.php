<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;

class LoginController extends Controller
{
    public function __construct(private AuthService $auth)
    {
    }

   

    public function login(LoginRequest $request)
    {
        $user = $this->auth->login(
            $request->input('email'),
            $request->input('password'),
        );

        return response()->json([
            'message' => 'Đăng nhập thành công.',
            'token'   => $this->auth->issueToken($user),
            'user'    => $user,   // có role để React điều hướng
        ]);
    }

    public function logout(Request $request)
    {
        $this->auth->logout($request->user());

        return response()->json(['message' => 'Đăng xuất thành công.']);
    }
}
