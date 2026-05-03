import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- CÁC API CHÍNH (ROUTES) ---
const apiRouter = express.Router();

// 1. Lấy danh sách khách hàng
apiRouter.get('/customers', async (req, res) => {
    try {
        let query = 'SELECT * FROM customers';
        let params = [];
        if (req.query.search) {
            query += ' WHERE full_name LIKE ? OR customer_code LIKE ? OR phone LIKE ? OR city LIKE ?';
            params = [`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`];
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. Lấy danh sách chi nhánh
apiRouter.get('/branches', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM branches');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Lấy danh sách loại hàng hóa
apiRouter.get('/shipment-types', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shipment_types');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Lấy danh sách đơn hàng (shipments) kèm tính năng lọc (Filter)
apiRouter.get('/shipments', async (req, res) => {
    try {
        let query = `
            SELECT s.*, 
                   c1.full_name as sender_name, 
                   c2.full_name as receiver_name,
                   t.type_name
            FROM shipments s
            LEFT JOIN customers c1 ON s.sender_customer_id = c1.customer_id
            LEFT JOIN customers c2 ON s.receiver_customer_id = c2.customer_id
            LEFT JOIN shipment_types t ON s.shipment_type_id = t.shipment_type_id
            WHERE 1=1
        `;
        let params = [];

        // Lọc theo trạng thái
        if (req.query.current_status || req.query.status) {
            query += ' AND s.current_status = ?';
            params.push(req.query.current_status || req.query.status);
        }

        // Lọc theo chi nhánh
        if (req.query.origin_branch_id || req.query.branch_id) {
            query += ' AND s.origin_branch_id = ?';
            params.push(req.query.origin_branch_id || req.query.branch_id);
        }

        query += ' ORDER BY s.booking_date DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 5. Tạo đơn hàng mới
apiRouter.post('/shipments', async (req, res) => {
    const {
        sender_customer_id,
        receiver_customer_id,
        shipment_type_id,
        origin_branch_id,
        weight,
        total_charge,
        notes
    } = req.body;

    // Generate random tracking number
    const tracking_number = "CX" + Math.floor(100000 + Math.random() * 900000);

    try {
        const [result] = await pool.query(`
            INSERT INTO shipments 
            (tracking_number, sender_customer_id, receiver_customer_id, shipment_type_id, origin_branch_id, weight, total_charge, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            tracking_number, sender_customer_id, receiver_customer_id, shipment_type_id, origin_branch_id, weight, total_charge, notes
        ]);

        res.status(201).json({ shipment_id: result.insertId, tracking_number });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 6. Cập nhật trạng thái đơn hàng
apiRouter.patch('/shipments/:id/status', async (req, res) => {
    const { status, status_note, updated_by_user_id } = req.body;
    const shipment_id = req.params.id;

    try {
        // Update shipment status
        await pool.query('UPDATE shipments SET current_status = ? WHERE shipment_id = ?', [status, shipment_id]);
        
        // Insert into history
        if (updated_by_user_id) {
            await pool.query(`
                INSERT INTO shipment_status_history (shipment_id, status, status_note, updated_by_user_id)
                VALUES (?, ?, ?, ?)
            `, [shipment_id, status, status_note || '', updated_by_user_id]);
        }
        
        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 7. Lấy danh sách hóa đơn
apiRouter.get('/bills', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM bills');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 8. Tra cứu đơn hàng theo tracking number
apiRouter.get('/tracking/:tracking', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT s.*, 
                   c1.full_name as sender_name, c1.phone as sender_phone, c1.address_line as sender_address,
                   c2.full_name as receiver_name, c2.phone as receiver_phone, c2.address_line as receiver_address,
                   t.type_name
            FROM shipments s
            LEFT JOIN customers c1 ON s.sender_customer_id = c1.customer_id
            LEFT JOIN customers c2 ON s.receiver_customer_id = c2.customer_id
            LEFT JOIN shipment_types t ON s.shipment_type_id = t.shipment_type_id
            WHERE s.tracking_number = ?
        `, [req.params.tracking]);

        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

        const shipment = rows[0];

        // Fetch history
        const [historyRows] = await pool.query(`
            SELECT h.*, u.full_name as updated_by_name
            FROM shipment_status_history h
            LEFT JOIN users u ON h.updated_by_user_id = u.user_id
            WHERE h.shipment_id = ?
            ORDER BY h.event_time DESC
        `, [shipment.shipment_id]);

        shipment.history = historyRows;
        res.json(shipment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.use('/api', apiRouter);

// Khởi chạy server trên cổng 5000
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 API Server (MySQL) is running on port ${PORT}`));