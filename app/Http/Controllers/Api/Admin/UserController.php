<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected $userService;

    // Tiêm UserService vào để sử dụng
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    // API lấy danh sách người dùng (có tìm kiếm và phân trang)
    public function index(Request $request)
    {
        $users = $this->userService->list($request->query('keyword'));
        return response()->json([
            'message' => 'Lấy danh sách thành công',
            'data' => $users
        ], 200);
    }

    // API Khóa / Mở khóa tài khoản
    public function toggleStatus($id)
    {
        try {
            $user = $this->userService->toggleLock($id);
            return response()->json([
                'message' => 'Cập nhật trạng thái thành công',
                'user' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}