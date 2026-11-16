<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'cart_items'; // Trỏ đúng tên bảng trong CSDL

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity'
    ];

    // Mối quan hệ với bảng Product
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}