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
        console.log('✅ Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
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

// Serve HTML files with specific routes
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

app.get('/add-vehicle', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/addVehicle.html'));
});

app.get('/update-parking', (req, res) => {
    res.sendFile(path.join(__dirname, '../parking-frontend/updateParking.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, '../parking-frontend')}`);
});