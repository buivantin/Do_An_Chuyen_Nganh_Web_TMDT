<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
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
            'name'     => trim($data['name']),
            'email'    => $email,
            'password' => Hash::make($data['password']),//bam mat khau
            'role'     => 'customer',
            'status'   => 'active',
        ]);
    }
}