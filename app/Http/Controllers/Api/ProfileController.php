<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ProfileController extends Controller
{
    // Lấy thông tin cá nhân hiện tại
    public function show()
    {
        return response()->json([
            'message' => 'Lấy thông tin thành công',
            'user' => Auth::user()
        ], 200);
    }

    // Cập nhật thông tin (Họ tên, SĐT, Địa chỉ)
    public function update(Request $request)
    {
        $user = $request->user();

        // Validate dữ liệu
        $validatedData = $request->validate([
            'username' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        // Cập nhật vào CSDL
        $user->update($validatedData);

        return response()->json([
            'message' => 'Cập nhật hồ sơ thành công',
            'user' => $user
        ], 200);
    }

    // Đổi mật khẩu (Bắt buộc nhập mật khẩu cũ)
    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required',
            'new_password' => 'required|min:8|confirmed', // 'confirmed' yêu cầu phải có trường new_password_confirmation
        ]);

        $user = $request->user();

        // Kiểm tra mật khẩu cũ
        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu cũ không chính xác'
            ], 400);
        }

        // Cập nhật mật khẩu mới (băm lại)
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công'
        ], 200);
    }

    // HÀM MỚI: Cập nhật ảnh đại diện
    public function updateAvatar(Request $request)
    {
        // Validate: Bắt buộc là file ảnh, đúng định dạng, tối đa 2MB (2048 KB)
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:2048', 
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // 1. Xóa ảnh cũ nếu có (để tránh rác server)
            if ($user->image_path && file_exists(public_path($user->image_path))) {
                unlink(public_path($user->image_path));
            }

            // 2. Lưu ảnh mới vào thư mục public/avatars
            $file = $request->file('avatar');
            // Đặt tên file để không bị trùng: thời_gian_tên_gốc
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('avatars'), $filename);
            
            // 3. Cập nhật đường dẫn vào CSDL (VD: avatars/12345_anh.jpg)
            $user->image_path = 'avatars/' . $filename;
            $user->save();

            return response()->json([
                'message' => 'Cập nhật ảnh đại diện thành công',
                'image_path' => $user->image_path
            ], 200);
        }

        return response()->json(['message' => 'Không tìm thấy file ảnh'], 400);
    }
}