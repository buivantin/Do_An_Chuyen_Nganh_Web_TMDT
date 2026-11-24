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
}