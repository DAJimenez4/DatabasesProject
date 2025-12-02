const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'password123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
}

generateHash();