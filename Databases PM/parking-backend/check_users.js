require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'parking_db'
};

async function checkUsers() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const [rows] = await connection.execute('SELECT user_id, uid, email, password_hash FROM Users');
        console.log('Current Users in DB:');
        console.table(rows);

        connection.end();
    } catch (error) {
        console.error('Error querying database:', error);
    }
}

checkUsers();