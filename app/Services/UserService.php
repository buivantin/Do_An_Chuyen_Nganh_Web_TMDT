<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth; 

class UserService
{
    // Lấy danh sách (có tìm kiếm + phân trang)
    public function list($keyword = null, $perPage = 10)
    {
        return User::when($keyword, function ($query, $keyword) {
                return $query->where('email', 'like', '%' . $keyword . '%');
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

        // Khóa / Mở khóa tài khoản
    public function toggleLock($id)
    {
        $user = User::findOrFail($id);
        
        // Không cho phép Admin tự khóa chính mình
        if ($user->id === Auth::id()) {
            throw new \Exception('Bạn không thể tự khóa tài khoản của mình');
        }

        // Đảo ngược trạng thái giữa 'active' và 'locked'
        $user->status = ($user->status === 'active') ? 'locked' : 'active';
        $user->save();
        
        return $user;
    }
}