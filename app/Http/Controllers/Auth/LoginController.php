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

    public function showForm()
    {
        return view('auth.login'); // TV3 làm view này
    }

    public function login(LoginRequest $request)
    {
        $user = $this->auth->login(
            $request->input('email'),
            $request->input('password'),
            $request->boolean('remember')
        );

        return $user->isAdmin() ? redirect('/admin') : redirect('/');
    }

    public function logout()
    {
        $this->auth->logout();

        return redirect('/');
    }
}
