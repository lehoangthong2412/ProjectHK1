<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShipmentType;

class ShipmentTypeController extends Controller
{
    public function index()
    {
        return response()->json(
            ShipmentType::orderBy('shipment_type_id')->get()
        );
    }
}
