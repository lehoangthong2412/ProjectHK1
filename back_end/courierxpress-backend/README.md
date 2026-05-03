# CourierXpress Backend

## Setup
1. Import `courierxpress_db.sql` into your local MySQL server.
2. Update database credentials in `db.js` or set environment variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`

## Run
```bash
npm install
npm start
```

## API Endpoints
- `GET /api/branches`
- `GET /api/customers`
- `GET /api/shipment-types`
- `GET /api/shipments`
- `GET /api/tracking/:tracking`
- `POST /api/shipments`
- `PATCH /api/shipments/:id/status`
- `GET /api/bills`
- `POST /api/bills`
- `PATCH /api/bills/:id/pay`
- `GET /api/reports/summary`
- `GET /api/users`
- `GET /api/agents`
- `POST /api/login`
