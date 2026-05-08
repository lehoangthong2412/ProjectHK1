<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shipment;
use App\Models\ShipmentStatusHistory;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Shipment::with(['sender', 'receiver', 'shipmentType', 'branch', 'agent', 'bill']);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('current_status', $request->status);
        }

        if ($request->filled('branch_id')) {
            $query->where('origin_branch_id', $request->branch_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%");
            });
        }

        return response()->json(
            $query->orderBy('shipment_id', 'desc')->get()
        );
    }

    public function show(Shipment $shipment)
    {
        $shipment->load(['sender', 'receiver', 'shipmentType', 'branch', 'agent', 'statusHistory.updatedBy', 'bill']);
        return response()->json($shipment);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sender_customer_id' => 'required|integer|exists:customers,customer_id',
            'receiver_customer_id' => 'required|integer|exists:customers,customer_id',
            'shipment_type_id' => 'required|integer|exists:shipment_types,shipment_type_id',
            'origin_branch_id' => 'required|integer|exists:branches,branch_id',
            'assigned_agent_id' => 'nullable|integer|exists:users,user_id',
            'weight' => 'required|numeric',
            'total_charge' => 'required|numeric',
            'current_status' => 'nullable|string|max:50',
            'booking_date' => 'nullable|date',
            'expected_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $data['tracking_number'] = 'TRK' . now()->format('YmdHis');
        $data['current_status'] = $data['current_status'] ?? 'BOOKED';
        $data['booking_date'] = $data['booking_date'] ?? now();

        $shipment = Shipment::create($data);

        ShipmentStatusHistory::create([
            'shipment_id' => $shipment->shipment_id,
            'status' => $shipment->current_status,
            'status_note' => 'Shipment created successfully',
            'updated_by_user_id' => $shipment->assigned_agent_id ?? 1,
            'event_time' => now(),
        ]);

        return response()->json(
            $shipment->load(['sender', 'receiver', 'shipmentType', 'branch', 'agent', 'bill']),
            201
        );
    }

    public function updateStatus(Request $request, Shipment $shipment)
    {
        $data = $request->validate([
            'status' => 'required|string|max:50',
            'status_note' => 'nullable|string|max:255',
            'updated_by_user_id' => 'required|integer|exists:users,user_id',
        ]);

        $shipment->current_status = $data['status'];
        $shipment->save();

        $history = ShipmentStatusHistory::create([
            'shipment_id' => $shipment->shipment_id,
            'status' => $data['status'],
            'status_note' => $data['status_note'] ?? null,
            'updated_by_user_id' => $data['updated_by_user_id'],
            'event_time' => now(),
        ]);

        return response()->json([
            'message' => 'Shipment status updated successfully',
            'shipment' => $shipment->fresh(['sender', 'receiver', 'shipmentType', 'branch', 'agent', 'bill']),
            'history' => $history,
        ]);
    }

    public function trackByNumber(string $tracking)
    {
        $shipment = Shipment::with(['sender', 'receiver', 'shipmentType', 'branch', 'statusHistory.updatedBy', 'bill'])
            ->where('tracking_number', $tracking)
            ->first();

        if (!$shipment) {
            return response()->json(['message' => 'Tracking number not found'], 404);
        }

        return response()->json($shipment);
    }
}
