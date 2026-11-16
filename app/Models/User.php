<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens,Notifiable;

    
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

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }
}
