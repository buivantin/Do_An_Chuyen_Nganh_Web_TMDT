<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $table = 'vouchers';

    protected $fillable = [
        'name',
        'code',
        'discount_type',
        'discount_amount',
        'max_discount',
        'min_order_value',
        'min_spent',
        'membership_tier',
        'usage_limit',
        'used_count',
        'target_tiers',
        'distribution_mode',
        'is_exclusive',
        'status',
        'start_date',
        'expiration_date',
        'requirement',
    ];

    protected $casts = [
        'discount_amount' => 'decimal:2',
        'max_discount'    => 'decimal:2',
        'min_order_value' => 'decimal:2',
        'min_spent'       => 'decimal:2',
        'membership_tier' => 'integer',
        'usage_limit'     => 'integer',
        'used_count'      => 'integer',
        'target_tiers'    => 'array',
        'is_exclusive'    => 'boolean',
        'start_date'      => 'datetime',
        'expiration_date' => 'datetime',
    ];

    protected $appends = [
        'tier_name',
        'is_expired',
        'effective_status',
    ];

    public function getTierNameAttribute(): string
    {
        if (is_array($this->target_tiers) && count($this->target_tiers) > 0) {
            $names = array_map(fn ($t) => User::TIERS[(int) $t] ?? "Cấp {$t}", $this->target_tiers);
            return implode(', ', $names);
        }

        if (is_null($this->membership_tier)) {
            return 'Tất cả cấp bậc';
        }

        return User::TIERS[$this->membership_tier] ?? 'Mầm Sách';
    }

    public function getIsExpiredAttribute(): bool
    {
        if (!$this->expiration_date) {
            return false;
        }

        return Carbon::now()->gt($this->expiration_date->copy()->endOfDay());
    }

    public function getEffectiveStatusAttribute(): string
    {
        if ($this->is_expired) {
            return 'expired';
        }

        if ($this->usage_limit > 0 && $this->used_count >= $this->usage_limit) {
            return 'exhausted';
        }

        return $this->status;
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_vouchers')
            ->withPivot(['assigned_at', 'used_at'])
            ->withTimestamps();
    }

    // Lấy danh sách các voucher đang trong thời gian hiệu lực và trạng thái active
    public function scopeAvailable($query)
    {
        $now = now();

        return $query->where('status', 'active')
            ->where(function ($q) use ($now) {
                $q->whereNull('start_date')->orWhere('start_date', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('expiration_date')->orWhere('expiration_date', '>=', $now);
            });
    }

    // Tính số tiền được giảm thực tế cho đơn hàng
    public function calculateDiscount(float $subtotal): float
    {
        if ($subtotal <= 0) {
            return 0;
        }

        if ($this->discount_type === 'percent') {
            $discount = $subtotal * ((float) $this->discount_amount / 100);
            if ((float) $this->max_discount > 0) {
                $discount = min($discount, (float) $this->max_discount);
            }
        } else {
            $discount = (float) $this->discount_amount;
        }

        return round(min($discount, $subtotal), 0);
    }

    // Kiểm tra điều kiện áp dụng voucher cho khách hàng và giá trị tạm tính đơn hàng
    public function validateForUser(?User $user, float $subtotal): array
    {
        if ($this->status !== 'active') {
            return ['valid' => false, 'message' => 'Mã giảm giá hiện không khả dụng.'];
        }

        if ($this->start_date && now()->lt($this->start_date)) {
            return ['valid' => false, 'message' => 'Mã giảm giá chưa đến thời gian áp dụng.'];
        }

        if ($this->is_expired) {
            return ['valid' => false, 'message' => 'Mã giảm giá đã hết hạn sử dụng.'];
        }

        if ($this->usage_limit > 0 && $this->used_count >= $this->usage_limit) {
            return ['valid' => false, 'message' => 'Mã giảm giá đã hết lượt sử dụng.'];
        }

        if ($subtotal < (float) $this->min_order_value) {
            return [
                'valid'   => false,
                'message' => 'Đơn hàng tối thiểu ' . number_format((float) $this->min_order_value, 0, ',', '.') . 'đ để áp dụng mã này.'
            ];
        }

        $hasTargetTiers = is_array($this->target_tiers) && count($this->target_tiers) > 0;
        $hasTierCondition = $hasTargetTiers || !is_null($this->membership_tier) || (float) $this->min_spent > 0 || $this->is_exclusive;

        if ($hasTierCondition && !$user) {
            return ['valid' => false, 'message' => 'Vui lòng đăng nhập để sử dụng mã ưu đãi thành viên.'];
        }

        if ($user) {
            // 1. Nếu là voucher phát giới hạn (Ưu tiên cấp cao / Random) -> bắt buộc user phải có tên trong bảng user_vouchers
            if ($this->is_exclusive) {
                $assigned = $this->users()->where('users.id', $user->id)->first();
                if (!$assigned) {
                    return ['valid' => false, 'message' => 'Bạn không nằm trong danh sách thành viên được nhận mã ưu đãi này.'];
                }
                if (!is_null($assigned->pivot->used_at)) {
                    return ['valid' => false, 'message' => 'Bạn đã sử dụng mã giảm giá này trước đó.'];
                }
            } else {
                // 2. Kiểm tra điều kiện hạng thành viên (ưu tiên target_tiers nếu có, ngược lại dùng membership_tier)
                if ($hasTargetTiers) {
                    if (!in_array((int) $user->membership_tier, array_map('intval', $this->target_tiers), true)) {
                        return ['valid' => false, 'message' => 'Mã này chỉ áp dụng cho hạng: ' . $this->tier_name . '.'];
                    }
                } elseif (!is_null($this->membership_tier) && (int) $user->membership_tier < (int) $this->membership_tier) {
                    return ['valid' => false, 'message' => 'Mã này chỉ dành cho hạng ' . $this->tier_name . ' trở lên.'];
                }
            }

            if ((float) $user->total_spent < (float) $this->min_spent) {
                return [
                    'valid'   => false,
                    'message' => 'Cần tích lũy chi tiêu từ ' . number_format((float) $this->min_spent, 0, ',', '.') . 'đ để dùng mã này.'
                ];
            }

            // 3. Kiểm tra khách hàng đã từng sử dụng mã này chưa (trừ đơn đã hủy)
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