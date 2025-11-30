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
    origin: 'http://127.0.0.1:5500', // Live Server URL
    credentials: true
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
    const { uid, email, password } = req.body;

    try {
        // Validate required fields
        if (!uid || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
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
            'INSERT INTO users (uid, email, password_hash) VALUES (?, ?, ?)',
            [uid, email, passwordHash]
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from: ${path.join(__dirname, '../parking-frontend')}`);
});