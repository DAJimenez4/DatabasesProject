const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbName = process.env.DB_NAME || 'parking_management';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
};

async function initDb() {
    try {
        // Connect without selecting a database first
        const connection = await mysql.createConnection(dbConfig);
        console.log('Connected to MySQL server.');

        console.log(`Resetting database '${dbName}'...`);
        await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
        console.log('Database dropped.');

        await connection.query(`CREATE DATABASE \`${dbName}\``);
        console.log('Database created.');

        await connection.query(`USE \`${dbName}\``);
        console.log(`Selected database '${dbName}'.`);

        const createTablesSql = fs.readFileSync(path.join(__dirname, '../../create.sql'), 'utf8');
        const loadDataSql = fs.readFileSync(path.join(__dirname, '../../load.sql'), 'utf8');

        console.log('Executing create.sql...');
        await connection.query(createTablesSql);
        console.log('create.sql executed.');

        console.log('Executing load.sql...');
        await connection.query(loadDataSql);
        console.log('load.sql executed.');

        await connection.end();
        console.log('Done.');
    } catch (error) {
        console.error('Error:', error);
    }
}

initDb();
