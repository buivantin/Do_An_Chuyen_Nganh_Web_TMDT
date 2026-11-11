<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    
    // ERD v2 chỉ có created_at, không có updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'username',
        'email',
        'password',
        'status',
        'image_path',
        'role',
    ];

    
    protected $hidden = [
        'password',
    ];

    
}
