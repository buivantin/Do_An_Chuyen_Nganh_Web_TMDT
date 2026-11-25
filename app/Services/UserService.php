<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function list(?string $keyword = null, int $perPage = 10)
    {
        $keyword = trim((string) $keyword);

        return User::query()
            ->when($keyword !== '', function ($query) use ($keyword) {
                $query->where(function ($q) use ($keyword) {
                    $q->where('username', 'like', "%{$keyword}%")
                      ->orWhere('email', 'like', "%{$keyword}%")
                      ->orWhere('phone', 'like', "%{$keyword}%");
                });
            })
            ->withCount([
                'orders as completed_orders_count' => fn ($q) => $q->where('status', 'completed'),
            ])
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function create(array $data): User
    {
        $role = ($data['role'] ?? 'customer') === 'admin' ? 'admin' : 'customer';

        return User::create([
            'username'        => trim($data['username']),
            'email'           => mb_strtolower(trim($data['email'])),
            'phone'           => !empty($data['phone']) ? trim($data['phone']) : null,
            'address'         => !empty($data['address']) ? trim($data['address']) : null,
            'password'        => Hash::make($data['password']),
            'role'            => $role,
            'status'          => ($data['status'] ?? 'active') === 'active' ? 'active' : 'inactive',
            'membership_tier' => $role === 'admin' ? 1 : (int) ($data['membership_tier'] ?? 1),
            'total_spent'     => 0,
        ]);
    }

    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            if (($data['role'] ?? $user->role) !== 'admin') {
                throw new \Exception('Bạn không thể tự hạ quyền quản trị của chính mình.');
            }
            if (($data['status'] ?? $user->status) !== 'active') {
                throw new \Exception('Bạn không thể tự khóa tài khoản đang đăng nhập.');
            }
        }

        $role   = ($data['role'] ?? $user->role) === 'admin' ? 'admin' : 'customer';
        $status = ($data['status'] ?? $user->status) === 'active' ? 'active' : 'inactive';

        $user->username        = trim($data['username']);
        $user->email           = mb_strtolower(trim($data['email']));
        $user->phone           = !empty($data['phone']) ? trim($data['phone']) : null;
        $user->address         = !empty($data['address']) ? trim($data['address']) : null;
        $user->role            = $role;
        $user->status          = $status;
        $user->membership_tier = $role === 'admin'
            ? 1
            : (int) ($data['membership_tier'] ?? $user->membership_tier ?? 1);

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        if ($user->status !== 'active') {
            $user->tokens()->delete();
        }

        return $user->fresh();
    }

    public function toggleLock(int $id): User
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            throw new \Exception('Bạn không thể tự khóa tài khoản của mình.');
        }

        $user->status = ($user->status === 'active') ? 'inactive' : 'active';
        $user->save();

        if ($user->status !== 'active') {
            $user->tokens()->delete();
        }

        return $user;
    }

    public function delete(int $id): void
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            throw new \Exception('Bạn không thể tự xóa tài khoản của chính mình.');
        }

        if ($user->orders()->exists()) {
            throw new \Exception('Tài khoản này đã phát sinh đơn hàng, không thể xóa vĩnh viễn. Vui lòng dùng chức năng Khóa tài khoản.');
        }

        $user->tokens()->delete();
        $user->delete();
    }
}