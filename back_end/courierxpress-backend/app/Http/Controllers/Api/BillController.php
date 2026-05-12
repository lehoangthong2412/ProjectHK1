<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;

class BillController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $query = Bill::with(['shipment.sender', 'shipment.receiver', 'shipment.shipmentType', 'shipment.branch']);

        if ($request->filled('branch_id')) {
            $query->whereHas('shipment', function ($q) use ($request) {
                $q->where('origin_branch_id', $request->branch_id);
            });
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        return response()->json(
            $query->orderBy('bill_id', 'desc')->get()
        );
    }

    public function show(Bill $bill)
    {
        $bill->load(['shipment.sender', 'shipment.receiver', 'shipment.shipmentType', 'shipment.branch']);
        return response()->json($bill);
    }

    public function byTracking(string $tracking)
    {
        $bill = Bill::whereHas('shipment', function ($q) use ($tracking) {
                $q->where('tracking_number', $tracking);
            })
            ->with(['shipment.sender', 'shipment.receiver', 'shipment.shipmentType', 'shipment.branch'])
            ->first();

        if (!$bill) {
            return response()->json(['message' => 'Bill not found for tracking number'], 404);
        }

        return response()->json($bill);
    }
}
