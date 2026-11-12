<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private UserRepository $users)
    {
    }

    public function register(array $data): User
    {
        $email = mb_strtolower(trim($data['email']));

        if ($this->users->emailExists($email)) {
            throw ValidationException::withMessages([
                'email' => 'Email này đã được đăng ký.',
            ]);
        }

        return $this->users->create([
            'username'     => trim($data['username']),
            'email'    => $email,
            'password' => Hash::make($data['password']),//bam mat khau
            'role'     => 'customer',
            'status'   => 'active',
        ]);
    }

    public function login(string $email, string $password, bool $remember = false):User
    {
        $email = mb_strtolower(trim($email));
        $user  = $this->users->findByEmail($email);

        if(!$user || !Hash::check($password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => 'Email hoặc mật khẩu không đúng.',
            ]);
        }
        if ($user->status !== 'active') {
        throw ValidationException::withMessages([
            'email' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
            ]);
        }
        Auth::login($user, $remember);
        request()->session()->regenerate();

        return $user;
    }
    public function logout(): void
    {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
    
}