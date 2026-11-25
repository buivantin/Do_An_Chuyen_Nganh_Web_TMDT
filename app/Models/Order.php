<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'voucher_id',
        'status',
        'payment_method',
        'shipping_fee',
        'total_amount',
        'address',
        'phone',
        'receiver_name',
        'note',
        'shipping_provider',
        'tracking_code',
        'shipper_info',
        'delivery_note',
        'completed_at',
        'return_type',
        'return_reason',
        'return_images',
        'return_requested_at',
        'admin_return_note',
    ];

    protected $casts = [
        'shipping_fee'        => 'decimal:2',
        'total_amount'        => 'decimal:2',
        'completed_at'        => 'datetime',
        'return_images'       => 'array',
        'return_requested_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }
}