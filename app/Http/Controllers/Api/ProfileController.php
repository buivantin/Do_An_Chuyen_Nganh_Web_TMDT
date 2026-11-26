<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Trả thông tin hồ sơ + tổng chi tiêu thực tế từ đơn đã giao/hoàn thành
     */
    private function formatUserWithStats($user): array
    {
        $totalSpent = Order::where('user_id', $user->id)
            ->whereIn('status', ['delivered', 'completed'])
            ->sum('total_amount');

        $data = $user->toArray();
        $data['total_spent'] = (float) $totalSpent;

        return $data;
    }

    /**
     * GET /api/profile
     */
    public function show(Request $request)
    {
        return response()->json([
            'user' => $this->formatUserWithStats($request->user()),
        ]);
    }

    /**
     * PUT /api/profile
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'phone'    => 'nullable|string|max:25',
            'address'  => 'nullable|string|max:500',
        ]);

        $user->username = $validated['username'];
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        if (array_key_exists('address', $validated)) {
            $user->address = $validated['address'];
        }
        $user->save();

        return response()->json([
            'message' => 'Đã cập nhật thông tin tài khoản thành công!',
            'user'    => $this->formatUserWithStats($user),
        ]);
    }

    /**
     * POST /api/profile/avatar
     */
    public function updateAvatar(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        ]);

        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar = $path;
        if (array_key_exists('image_path', $user->getAttributes())) {
            $user->image_path = $path;
        }
        $user->save();

        $userData = $this->formatUserWithStats($user);

        return response()->json([
            'message' => 'Đã cập nhật ảnh đại diện!',
            'avatar'  => $path,
            'user'    => $userData,
        ]);
    }

    /**
     * PUT /api/profile/change-password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'old_password' => 'required|string',
            'new_password' => ['required', 'string', 'confirmed', Password::min(8)],
        ]);

        if (!Hash::check($validated['old_password'], $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu hiện tại không chính xác.',
            ], 422);
        }

        if (Hash::check($validated['new_password'], $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu mới không được trùng với mật khẩu hiện tại.',
            ], 422);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Đổi mật khẩu thành công!',
        ]);
    }
}