<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$cols = DB::select('SHOW COLUMNS FROM shipments WHERE Field = "expected_delivery_date"');
print_r($cols[0]->Type);
echo "\n";
