<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $table = 'vouchers';

    protected $fillable = [
        'name',
        'code',
        'discount_amount',
        'min_order_value',
        'min_spent',
        'membership_tier',
        'status',
        'start_date',
        'expiration_date',
        'requirement',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'min_order_value' => 'decimal:2',
        'min_spent'       => 'decimal:2',
        'membership_tier' => 'integer',
        'start_date'      => 'datetime',
        'expiration_date' => 'datetime',
    ];

    public function getTierNameAttribute(): string
    {
        if (is_null($this->membership_tier)) {
            return 'Tất cả cấp bậc';
        }

        return User::TIERS[$this->membership_tier] ?? 'Mầm Sách';
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    // Lấy danh sách các voucher đang trong thời gian hiệu lực và trạng thái active
    public function scopeAvailable($query)
    {
        $now = now();

        return $query->where('status', 'active')
            ->where('start_date', '<=', $now)
            ->where('expiration_date', '>=', $now);
    }

    // Kiểm tra điều kiện áp dụng voucher cho khách hàng và giá trị tạm tính đơn hàng
    public function validateForUser(?User $user, float $subtotal): array
    {
        if ($this->status !== 'active') {
            return ['valid' => false, 'message' => 'Mã giảm giá hiện không khả dụng.'];
        }

        if (now()->lt($this->start_date) || now()->gt($this->expiration_date)) {
            return ['valid' => false, 'message' => 'Mã giảm giá chưa đến hạn hoặc đã hết hạn.'];
        }

        if ($subtotal < (float) $this->min_order_value) {
            return [
                'valid'   => false,
                'message' => 'Đơn hàng tối thiểu ' . number_format((float) $this->min_order_value, 0, ',', '.') . 'đ để áp dụng mã này.'
            ];
        }

        // Kiểm tra điều kiện hạng thành viên và chi tiêu tích lũy
        if (!is_null($this->membership_tier) || (float) $this->min_spent > 0) {
            if (!$user) {
                return ['valid' => false, 'message' => 'Vui lòng đăng nhập để sử dụng mã ưu đãi thành viên.'];
            }

            if (!is_null($this->membership_tier) && (int) $user->membership_tier < (int) $this->membership_tier) {
                return ['valid' => false, 'message' => 'Mã này chỉ dành cho hạng ' . $this->tier_name . ' trở lên.'];
            }

            if ((float) $user->total_spent < (float) $this->min_spent) {
                return [
                    'valid'   => false,
                    'message' => 'Cần tích lũy chi tiêu từ ' . number_format((float) $this->min_spent, 0, ',', '.') . 'đ để dùng mã này.'
                ];
            }
        }

        // Kiểm tra khách hàng đã từng sử dụng mã này chưa (trừ đơn đã hủy)
        if ($user) {
            $used = $this->orders()
                ->where('user_id', $user->id)
                ->where('status', '!=', 'cancelled')
                ->exists();

            if ($used) {
                return ['valid' => false, 'message' => 'Bạn đã sử dụng mã giảm giá này cho một đơn hàng trước đó.'];
            }
        }

        return ['valid' => true, 'message' => 'Áp dụng mã giảm giá thành công!'];
    }
}