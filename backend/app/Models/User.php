<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Support\Facades\Request;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone',
        'role',
        'is_premium',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function get_user() {
        $token = PersonalAccessToken::findToken(Request::cookie('auth_token'));
        $user = $token->tokenable;

        return $user;
    }

    public function is_admin() {
        return $this->role == 'admin';
    }

    public function courses() {
        if($this->is_admin()) {
            return $this->hasMany(Course::class);
        }
    }

    public function subscribtions() {
        if(!$this->is_admin()) {
            return $this->belongsToMany(Subscribtion::class);
        }
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function balance() {
        if(!$this->is_admin()) {
            return $this->hasOne(Balance::class);
        }
    }

    public function likes() {
        return $this->hasMany(Like::class);
    }

    public function tools() {
        return $this->hasMany(ManagementTool::class);
    }

    public function consultationReservations() {
        return $this->hasMany(ConsultationReservation::class);
    }

    protected static function boot() {
        parent::boot();

        static::retrieved(function($user) {
            if(!$user->is_admin() && request()->is('api/users/*')) {
                $user->load('balance:user_id,amount');
            }
        });
    }
}
