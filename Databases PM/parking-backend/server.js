const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors({
    origin: true, // Reflects the request origin, effectively allowing any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve frontend files from the parking-frontend directory
app.use(express.static(path.join(__dirname, '../parking-frontend')));


require('dotenv').config();

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parking_management'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error.message);
    }
}

testConnection();

// Signup API endpoint
app.post('/api/signup', async (req, res) => {
    const { uid, email, password, first_name, last_name, phone_number, role } = req.body;

    try {
        // Validate required fields
        if (!uid || !email || !password || !first_name || !last_name || !role) {
            return res.status(400).json({
                success: false,
                message: 'All required fields (UID, Email, Password, First Name, Last Name, Role) must be provided'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert user into database
        const [result] = await pool.execute(
            'INSERT INTO users (uid, email, password_hash, first_name, last_name, phone_number, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [uid, email, passwordHash, first_name, last_name, phone_number || null, role]
        );

        res.json({
            success: true,
            message: 'User registered successfully',
            userId: result.insertId
        });

    } catch (error) {
        console.error('Signup error:', error);

        // Handle duplicate entries
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('uid')) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID already exists'
                });
            } else if (error.sqlMessage.includes('email')) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login API endpoint
app.post('/api/login', async (req, res) => {
    const { uid, password } = req.body;

    try {
        // Validate required fields
        if (!uid || !password) {
            return res.status(400).json({
                success: false,
                message: 'UID and password are required'
            });
        }

        // Find user by UID
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE uid = ?',
            [uid]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid UID or password'
            });
        }

        // Compare password with hashed password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid UID or password'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                uid: user.uid,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Admin Login API endpoint
app.post('/api/admin/login', async (req, res) => {
    const { uid, password } = req.body;

    try {
        // Validate required fields
        if (!uid || !password) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID and password are required'
            });
        }

        // Find user by UID
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE uid = ?',
            [uid]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Employee ID or password'
            });
        }

        // Compare password with hashed password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Employee ID or password'
            });
        }

        // Check if user has admin/employee role
        const adminRoles = ['admin', 'employee', 'staff', 'faculty'];
        if (!adminRoles.includes(user.role.toLowerCase())) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Employee credentials required.'
            });
        }

        res.json({
            success: true,
            message: 'Employee login successful',
            user: {
                user_id: user.user_id,
                uid: user.uid,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Vehicles by UID
app.get('/api/vehicles/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const [rows] = await pool.execute(
            `SELECT v.* 
             FROM Vehicles v
             JOIN Users u ON v.user_id = u.user_id
             WHERE u.uid = ?`,
            [uid]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Permits by UID
app.get('/api/permits/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const [rows] = await pool.execute(
            `SELECT p.purchase_date, p.expiration_date, pg.grade_name, pg.grade_price
             FROM Permit p
             JOIN Users u ON p.user_id = u.user_id
             JOIN Permit_Grade pg ON p.grade_id = pg.grade_id
             WHERE u.uid = ?`,
            [uid]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching permits:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Citations by UID
app.get('/api/citations/:uid', async (req, res) => {
    const { uid } = req.params;
    try {
        const [rows] = await pool.execute(
            `SELECT c.*, v.license_plate, v.model
             FROM Citations c
             JOIN Vehicles v ON c.vehicle_id = v.vehicle_id
             JOIN Users u ON v.user_id = u.user_id
             WHERE u.uid = ?`,
            [uid]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching citations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Permit Grades
app.get('/api/permit-grades', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM Permit_Grade');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching permit grades:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Vehicle
app.post('/api/vehicles', async (req, res) => {
    const { uid, license_plate, model, color } = req.body;

    try {
        const [userRows] = await pool.execute('SELECT user_id FROM Users WHERE uid = ?', [uid]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user_id = userRows[0].user_id;

        const [countRows] = await pool.execute('SELECT COUNT(*) as count FROM Vehicles WHERE user_id = ?', [user_id]);
        if (countRows[0].count >= 2) {
            return res.status(400).json({ success: false, message: 'Maximum of 2 vehicles allowed' });
        }

        await pool.execute(
            'INSERT INTO Vehicles (license_plate, model, color, user_id) VALUES (?, ?, ?, ?)',
            [license_plate, model, color, user_id]
        );

        res.json({ success: true, message: 'Vehicle added successfully' });
    } catch (error) {
        console.error('Error adding vehicle:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'License plate already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Create Permit
app.post('/api/permits', async (req, res) => {
    const { uid, grade_id } = req.body;

    try {
        const [userRows] = await pool.execute('SELECT user_id FROM Users WHERE uid = ?', [uid]);
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user_id = userRows[0].user_id;

        const purchase_date = new Date();
        const expiration_date = new Date(purchase_date);
        expiration_date.setFullYear(expiration_date.getFullYear() + 1);

        const purchase_date_str = purchase_date.toISOString().slice(0, 10);
        const expiration_date_str = expiration_date.toISOString().slice(0, 10);

        await pool.execute(
            'INSERT INTO Permit (user_id, vehicle_id, grade_id, purchase_date, expiration_date) VALUES (?, NULL, ?, ?, ?)',
            [user_id, grade_id, purchase_date_str, expiration_date_str]
        );

        res.json({ success: true, message: 'Permit purchased successfully' });
    } catch (error) {
        console.error('Error purchasing permit:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/api/vehicle/:vehicle_id', async (req, res) => {
    const { vehicle_id } = req.params;
    try {
        const [rows] = await pool.execute('SELECT * FROM Vehicles WHERE vehicle_id = ?', [vehicle_id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/vehicles/:vehicle_id', async (req, res) => {
    const { vehicle_id } = req.params;
    const { license_plate, model, color } = req.body;

    try {
        await pool.execute(
            'UPDATE Vehicles SET license_plate = ?, model = ?, color = ? WHERE vehicle_id = ?',
            [license_plate, model, color, vehicle_id]
        );
        res.json({ success: true, message: 'Vehicle updated successfully' });
    } catch (error) {
        console.error('Error updating vehicle:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'License plate already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.delete('/api/vehicles/:vehicle_id', async (req, res) => {
    const { vehicle_id } = req.params;

    try {
        await pool.execute('DELETE FROM Vehicles WHERE vehicle_id = ?', [vehicle_id]);
        res.json({ success: true, message: 'Vehicle deleted successfully' });
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/main.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/signUp.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/userDashboard.html'));
});

app.get('/citations', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/viewCitations.html'));
});

app.get('/api/all-citations', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT c.*, v.license_plate, v.model, u.first_name, u.last_name
             FROM Citations c
             JOIN Vehicles v ON c.vehicle_id = v.vehicle_id
             JOIN Users u ON v.user_id = u.user_id
             ORDER BY c.citation_date DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all citations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/all-vehicles', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT v.vehicle_id, v.license_plate, v.model, u.first_name, u.last_name 
             FROM Vehicles v 
             JOIN Users u ON v.user_id = u.user_id`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching all vehicles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/citations', async (req, res) => {
    const { license_plate, citation_date, reason, amount, status } = req.body;

    try {
        const [vehicleRows] = await pool.execute('SELECT vehicle_id FROM Vehicles WHERE license_plate = ?', [license_plate]);

        if (vehicleRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Vehicle not found with this license plate' });
        }
        const vehicle_id = vehicleRows[0].vehicle_id;

        const citation_number = `CIT-${Date.now().toString().slice(-8)}`;

        await pool.execute(
            'INSERT INTO Citations (citation_number, citation_date, reason, amount, status, vehicle_id) VALUES (?, ?, ?, ?, ?, ?)',
            [citation_number, citation_date, reason, amount, status || 'Unpaid', vehicle_id]
        );

        res.json({ success: true, message: 'Citation created successfully', citation_number });
    } catch (error) {
        console.error('Error creating citation:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'Citation number already exists' });
        }
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.put('/api/citations/:id', async (req, res) => {
    const { id } = req.params;
    const { citation_date, reason, amount, status } = req.body;

    try {
        await pool.execute(
            'UPDATE Citations SET citation_date = ?, reason = ?, amount = ?, status = ? WHERE citation_id = ?',
            [citation_date, reason, amount, status, id]
        );
        res.json({ success: true, message: 'Citation updated successfully' });
    } catch (error) {
        console.error('Error updating citation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.delete('/api/citations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('DELETE FROM Citations WHERE citation_id = ?', [id]);
        res.json({ success: true, message: 'Citation deleted successfully' });
    } catch (error) {
        console.error('Error deleting citation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/add-vehicle', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/addVehicle.html'));
});

app.get('/edit-vehicle', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/editVehicle.html'));
});

app.get('/add-permit', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/addPermit.html'));
});

app.get('/update-parking', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/updateParking.html'));
});

app.get('/permits', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/viewPermits.html'));
});

app.get('/vehicles', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/viewVehicles.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.post('/api/citations/:id/pay', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.execute('UPDATE Citations SET status = ? WHERE citation_id = ?', ['Paid', id]);
        res.json({ success: true, message: 'Citation paid successfully' });
    } catch (error) {
        console.error('Error paying citation:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/admin-login', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/adminLogin.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/adminDashboard.html'));
});

app.get('/add-citation', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/addCitation.html'));
});

app.get('/edit-citation', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/editCitation.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving frontend from: ${path.join(__dirname, '../parking-frontend')}`);
});