<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $table = 'products';

    protected $fillable = [
        'name',
        'author',
        'publisher',
        'published_year',
        'page_count',
        'description',
        'status',
        'price',
        'discount',
        'category_id',
        'image',
        'stock',
        'is_deleted',
    ];

    protected $casts = [
        'published_year' => 'integer',
        'page_count' => 'integer',
        'price' => 'decimal:2',
        'discount' => 'integer',
        'stock' => 'integer',
        'is_deleted' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}