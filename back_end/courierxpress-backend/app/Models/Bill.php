<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $table = 'bills';
    protected $primaryKey = 'bill_id';
    public $timestamps = false;

    protected $fillable = [
        'bill_number',
        'shipment_id',
        'total_amount',
        'payment_status',
        'payment_method',
        'issued_at',
        'created_by_user_id',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class, 'shipment_id', 'shipment_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id', 'user_id');
    }
}
