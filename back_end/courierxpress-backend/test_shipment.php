<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$shipment = DB::select('SELECT expected_delivery_date FROM shipments ORDER BY shipment_id DESC LIMIT 1');
print_r($shipment);
