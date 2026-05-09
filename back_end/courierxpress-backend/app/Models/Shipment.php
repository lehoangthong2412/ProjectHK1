<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    protected $table = 'shipments';
    protected $primaryKey = 'shipment_id';
    public $timestamps = false;

    protected $fillable = [
        'tracking_number',
        'sender_customer_id',
        'receiver_customer_id',
        'shipment_type_id',
        'origin_branch_id',
        'assigned_agent_id',
        'created_by_user_id',
        'booking_source',
        'confirmed_by_agent_id',
        'confirmed_at',
        'weight',
        'total_charge',
        'parcel_name',
        'item_description',
        'current_status',
        'booking_date',
        'expected_delivery_date',
        'notes',
    ];

    public function sender()
    {
        return $this->belongsTo(Customer::class, 'sender_customer_id', 'customer_id');
    }

    public function receiver()
    {
        return $this->belongsTo(Customer::class, 'receiver_customer_id', 'customer_id');
    }

    public function shipmentType()
    {
        return $this->belongsTo(ShipmentType::class, 'shipment_type_id', 'shipment_type_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'origin_branch_id', 'branch_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'assigned_agent_id', 'user_id');
    }

    public function statusHistory()
    {
        return $this->hasMany(ShipmentStatusHistory::class, 'shipment_id', 'shipment_id')->orderBy('event_time', 'asc');
    }

    public function bill()
    {
        return $this->hasOne(Bill::class, 'shipment_id', 'shipment_id');
    }
}
