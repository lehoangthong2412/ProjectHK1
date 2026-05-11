<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$shipment = \App\Models\Shipment::create([
    'tracking_number' => 'TRKTEST' . time(),
    'sender_customer_id' => 1,
    'receiver_customer_id' => 1,
    'shipment_type_id' => 1,
    'origin_branch_id' => 1,
    'assigned_agent_id' => 1,
    'weight' => 1,
    'total_charge' => 100,
    'current_status' => 'BOOKED',
    'booking_date' => now(),
    'expected_delivery_date' => '2026-05-11 15:30:45',
    'notes' => 'Test',
    'booking_source' => 'AGENT_COUNTER',
]);

echo "Created shipment ID: " . $shipment->shipment_id . "\n";
echo "Expected delivery date stored: " . $shipment->expected_delivery_date . "\n";

$dbShipment = DB::select('SELECT expected_delivery_date FROM shipments WHERE shipment_id = ?', [$shipment->shipment_id]);
echo "From DB: " . $dbShipment[0]->expected_delivery_date . "\n";
