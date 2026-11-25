<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct(protected UserService $userService)
    {
    }

    public function index(Request $request)
    {
        $users = $this->userService->list($request->query('keyword'));

        return response()->json([
            'message' => 'Lấy danh sách thành công',
            'data'    => $users,
        ], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username'        => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\p{L}\s]+$/u'],
            'email'           => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone'           => ['nullable', 'string', 'max:20'],
            'address'         => ['nullable', 'string', 'max:255'],
            'password'        => ['required', 'string', 'min:8', 'max:64'],
            'role'            => ['required', Rule::in(['customer', 'admin'])],
            'membership_tier' => ['nullable', 'integer', 'between:1,5'],
            'status'          => ['required', Rule::in(['active', 'inactive'])],
        ], [
            'username.required' => 'Vui lòng nhập họ và tên.',
            'username.regex'    => 'Họ và tên chỉ được gồm chữ cái và khoảng trắng.',
            'email.required'    => 'Vui lòng nhập địa chỉ email.',
            'email.unique'      => 'Email này đã tồn tại trên hệ thống.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min'      => 'Mật khẩu phải có ít nhất 8 ký tự.',
        ]);

        $user = $this->userService->create($validated);

        return response()->json([
            'message' => 'Thêm người dùng mới thành công',
            'user'    => $user,
        ], 201);
    }

    public function update(Request $request, int $id)
    {
        $validated = $request->validate([
            'username'        => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\p{L}\s]+$/u'],
            'email'           => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($id)],
            'phone'           => ['nullable', 'string', 'max:20'],
            'address'         => ['nullable', 'string', 'max:255'],
            'password'        => ['nullable', 'string', 'min:8', 'max:64'],
            'role'            => ['required', Rule::in(['customer', 'admin'])],
            'membership_tier' => ['nullable', 'integer', 'between:1,5'],
            'status'          => ['required', Rule::in(['active', 'inactive'])],
        ], [
            'username.required' => 'Vui lòng nhập họ và tên.',
            'username.regex'    => 'Họ và tên chỉ được gồm chữ cái và khoảng trắng.',
            'email.required'    => 'Vui lòng nhập địa chỉ email.',
            'email.unique'      => 'Email này đã được sử dụng bởi tài khoản khác.',
            'password.min'      => 'Mật khẩu mới phải có ít nhất 8 ký tự.',
        ]);

        try {
            $user = $this->userService->update($id, $validated);

            return response()->json([
                'message' => 'Cập nhật thông tin người dùng thành công',
                'user'    => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function toggleStatus(int $id)
    {
        try {
            $user = $this->userService->toggleLock($id);

            return response()->json([
                'message' => $user->status === 'active'
                    ? 'Đã mở khóa tài khoản thành công'
                    : 'Đã khóa tài khoản thành công',
                'user'    => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    public function destroy(int $id)
    {
        try {
            $this->userService->delete($id);

            return response()->json([
                'message' => 'Đã xóa người dùng thành công',
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }
}