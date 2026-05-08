<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;

class BillController extends Controller
{
    public function index()
    {
        return response()->json(
            Bill::with(['shipment.sender', 'shipment.receiver', 'shipment.shipmentType', 'shipment.branch'])
                ->orderBy('bill_id', 'desc')
                ->get()
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
