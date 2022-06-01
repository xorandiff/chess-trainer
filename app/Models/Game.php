<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'id',
        'pgn',
        'event',
        'site',
        'date',
        'round',
        'white',
        'black',
        'result'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
