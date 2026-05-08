<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipmentType extends Model
{
    protected $table = 'shipment_types';
    protected $primaryKey = 'shipment_type_id';
    public $timestamps = false;

    protected $fillable = [
        'type_name',
        'description',
        'base_rate',
    ];
}
