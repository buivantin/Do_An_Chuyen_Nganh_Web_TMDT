<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    public const TIERS = [
        1 => 'Mầm Sách',
        2 => 'Người Đọc',
        3 => 'Tri Thức',
        4 => 'Học Giả',
        5 => 'Đại Sứ Tri Thức',
    ];

    protected $fillable = [
        'username',
        'email',
        'password',
        'phone',
        'address',
        'status',
        'image_path',
        'role',
        'total_spent',
        'membership_tier',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'total_spent'       => 'decimal:2',
        'membership_tier'   => 'integer',
    ];

    public function getTierNameAttribute(): string
    {
        if ($this->role === 'admin' || is_null($this->membership_tier)) {
            return 'Quản trị viên';
        }

        return self::TIERS[$this->membership_tier] ?? 'Mầm Sách';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    // Tự động tính lại tổng chi tiêu tích lũy và cập nhật cấp bậc (1..5)
    public function refreshMembershipTier(): void
    {
        if ($this->isAdmin()) {
            return;
        }

        $spent = (float) $this->orders()
            ->where('status', 'completed')
            ->sum('total_amount');

        $tier = match (true) {
            $spent >= 3500000 => 5, // 05. Đại Sứ Tri Thức
            $spent >= 1800000 => 4, // 04. Học Giả
            $spent >= 800000  => 3, // 03. Tri Thức
            $spent >= 300000  => 2, // 02. Người Đọc
            default           => 1, // 01. Mầm Sách
        };

        $this->update([
            'total_spent'     => $spent,
            'membership_tier' => $tier,
        ]);
    }
}