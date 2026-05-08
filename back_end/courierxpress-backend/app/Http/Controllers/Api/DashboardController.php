<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Shipment;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_shipments' => Shipment::count(),
            'booked' => Shipment::where('current_status', 'BOOKED')->count(),
            'in_transit' => Shipment::where('current_status', 'IN_TRANSIT')->count(),
            'delivered' => Shipment::where('current_status', 'DELIVERED')->count(),
            'cancelled' => Shipment::where('current_status', 'CANCELLED')->count(),
            'revenue' => Bill::sum('total_amount'),
            'unpaid_bills' => Bill::where('payment_status', 'UNPAID')->count(),
        ]);
    }
}
