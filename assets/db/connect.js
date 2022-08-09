const mysql = require('mysql');
const data = require('./data.json');

module.exports = (client) => {
    const db = new mysql.createConnection(data);

    db.connect((error) => {
        if (error) throw error;
        client.db = db;

        console.log("Database connectée");
    });
};