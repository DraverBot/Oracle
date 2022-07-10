module.exports.connect = () => {
    const mysql = require('mysql');

    const db = new mysql.createConnection({
        "database": "YeikzyBot",
        "host": "127.0.0.1",
        "user": "Yeikzy",
        "password": "Yeikzy040206"
    });

    db.connect((error) => {
        if (error) throw error;
    });

    return db;
};