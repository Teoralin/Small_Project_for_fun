const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config()

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB,
    ssl: {
        rejectUnauthorized: true,
    }
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

function query(sql, params) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}
async function insertUser(username, email, password, name, contactInfo, role) {
    try {
        const insertQuery = `
        INSERT INTO user (username, email, password, name, contact_info, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
        const values = [username, email, password, name, contactInfo, role];
        const result = await query(insertQuery, values);
        return result.insertId;
    } catch (error) {
        console.error('Error inserting user:', error.message);
        return null;
    }
}

function closeConnection() {
    connection.end((err) => {
        if (err) {
            console.error('Error closing the database connection:', err);
        } else {
            console.log('Database connection closed');
        }
    });
}

// async function main() {
//     const newuser = await insertUser("Bdadxhgdhdg", "sdgsh@setspidr.com", "sdfghghbjnm", "Blyadi", "stroka", "Registered User");
// }

// // Use an IIFE (Immediately Invoked Function Expression) to await main and closeConnection sequentially
// (async () => {
//     await main();
//     closeConnection();
// })();
closeConnection();