const mysql = require('mysql2');

// conexão usando URL do Railway
const db = mysql.createPool({
    uri: process.env.MYSQL_URL
});

module.exports = db.promise();
