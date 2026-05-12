<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Shipment;

class DashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $shipmentQuery = Shipment::query();
        $billQuery = Bill::query();

        if ($request->filled('branch_id')) {
            $shipmentQuery->where('origin_branch_id', $request->branch_id);
            $billQuery->whereHas('shipment', function($q) use ($request) {
                $q->where('origin_branch_id', $request->branch_id);
            });
        }

        if ($request->filled('start_date')) {
            $shipmentQuery->whereDate('booking_date', '>=', $request->start_date);
            $billQuery->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $shipmentQuery->whereDate('booking_date', '<=', $request->end_date);
            $billQuery->whereDate('created_at', '<=', $request->end_date);
        }

        return response()->json([
            'total_shipments' => (clone $shipmentQuery)->count(),
            'booked' => (clone $shipmentQuery)->where('current_status', 'BOOKED')->count(),
            'in_transit' => (clone $shipmentQuery)->where('current_status', 'IN_TRANSIT')->count(),
            'delivered' => (clone $shipmentQuery)->where('current_status', 'DELIVERED')->count(),
            'cancelled' => (clone $shipmentQuery)->where('current_status', 'CANCELLED')->count(),
            'revenue' => (clone $billQuery)->sum('total_amount'),
            'unpaid_bills' => (clone $billQuery)->where('payment_status', 'UNPAID')->count(),
            'total_bills' => (clone $billQuery)->count(),
        ]);
    }
}
