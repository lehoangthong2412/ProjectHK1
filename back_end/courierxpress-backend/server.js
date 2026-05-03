import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import pool from './db.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'courierxpress-secret';

// Middleware
app.use(cors());
app.use(express.json());

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization header is required' });

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) return res.status(401).json({ message: 'Invalid authorization format' });

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}

function authorize(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Không có quyền truy cập' });
        }
        next();
    };
}

// --- CÁC API CHÍNH (ROUTES) ---
const apiRouter = express.Router();

// 1. Lấy danh sách khách hàng
apiRouter.get('/customers', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
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
apiRouter.get('/branches', authenticate, authorize('ADMIN'), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM branches');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 3. Lấy danh sách loại hàng hóa
apiRouter.get('/shipment-types', authenticate, authorize('ADMIN', 'AGENT', 'CUSTOMER'), async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM shipment_types');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. Lấy danh sách đơn hàng (shipments) kèm tính năng lọc (Filter)
apiRouter.get('/shipments', authenticate, authorize('ADMIN', 'AGENT', 'CUSTOMER'), async (req, res) => {
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

        if (req.user.role === 'CUSTOMER') {
            query += ' AND (s.sender_customer_id IN (SELECT customer_id FROM customers WHERE user_id = ?) OR s.receiver_customer_id IN (SELECT customer_id FROM customers WHERE user_id = ?))';
            params.push(req.user.user_id, req.user.user_id);
        }

        if (req.query.current_status || req.query.status) {
            query += ' AND s.current_status = ?';
            params.push(req.query.current_status || req.query.status);
        }

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
apiRouter.post('/shipments', authenticate, authorize('ADMIN', 'AGENT', 'CUSTOMER'), async (req, res) => {
    const {
        sender_customer_id,
        receiver_customer_id,
        shipment_type_id,
        origin_branch_id,
        weight,
        total_charge,
        notes
    } = req.body;

    const missingFields = [];
    if (!sender_customer_id) missingFields.push('sender_customer_id');
    if (!receiver_customer_id) missingFields.push('receiver_customer_id');
    if (!shipment_type_id) missingFields.push('shipment_type_id');
    if (!origin_branch_id) missingFields.push('origin_branch_id');
    if (weight === undefined || weight === null) missingFields.push('weight');
    if (total_charge === undefined || total_charge === null) missingFields.push('total_charge');

    if (missingFields.length > 0) {
        return res.status(400).json({ message: `Thiếu trường: ${missingFields.join(', ')}` });
    }

    if (req.user.role === 'CUSTOMER') {
        const [customerRows] = await pool.query('SELECT customer_id FROM customers WHERE user_id = ?', [req.user.user_id]);
        if (customerRows.length === 0 || customerRows[0].customer_id !== sender_customer_id) {
            return res.status(403).json({ message: 'Customer chỉ được tạo đơn cho chính mình' });
        }
    }

    const tracking_number = 'CX' + Math.floor(100000 + Math.random() * 900000);

    try {
        const [result] = await pool.query(`
            INSERT INTO shipments 
            (tracking_number, sender_customer_id, receiver_customer_id, shipment_type_id, origin_branch_id, weight, total_charge, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            tracking_number,
            sender_customer_id,
            receiver_customer_id,
            shipment_type_id,
            origin_branch_id,
            weight,
            total_charge,
            notes || ''
        ]);

        res.status(201).json({ shipment_id: result.insertId, tracking_number });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 6. Cập nhật trạng thái đơn hàng
apiRouter.patch('/shipments/:id/status', authenticate, authorize('ADMIN', 'AGENT'), async (req, res) => {
    const { status, status_note } = req.body;
    const shipment_id = req.params.id;

    if (!status) {
        return res.status(400).json({ message: 'Trạng thái mới là bắt buộc' });
    }

    try {
        await pool.query('UPDATE shipments SET current_status = ? WHERE shipment_id = ?', [status, shipment_id]);
        await pool.query(`
            INSERT INTO shipment_status_history (shipment_id, status, status_note, updated_by_user_id)
            VALUES (?, ?, ?, ?)
        `, [shipment_id, status, status_note || '', req.user.user_id]);

        res.json({ message: 'Status updated successfully' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 7. Lấy danh sách hóa đơn
apiRouter.get('/bills', authenticate, authorize('ADMIN'), async (req, res) => {
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

// 9. API login: username/password cho ADMIN, AGENT, CUSTOMER
apiRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username và password là bắt buộc' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT user_id, username, full_name, email, phone, role, branch_id, password_hash FROM users WHERE username = ? AND is_active = 1',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Sai username hoặc password' });
        }

        const user = rows[0];
        if (user.password_hash !== password) {
            return res.status(401).json({ message: 'Sai username hoặc password' });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
                branch_id: user.branch_id
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        const { password_hash, ...safeUser } = user;
        res.json({ token, ...safeUser });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.use('/api', apiRouter);

// Khởi chạy server trên cổng 5000
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 API Server (MySQL) is running on port ${PORT}`));