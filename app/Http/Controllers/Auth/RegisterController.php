<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use App\Services\AuthService;

class RegisterController extends Controller
{
    public function __construct(private AuthService $auth)
    {
    }

    public function showForm()
    {
        return view('auth.register');
    }

    public function store(RegisterRequest $request)
    {
        $this->auth->register($request->validated());

        return redirect()->route('register')
            ->with('success', 'Đăng ký thành công!');
    }
}
