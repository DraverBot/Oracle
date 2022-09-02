let { beta } = require('./assets/data/data.json');

module.exports.connect = () => {
    const mysql = require('mysql');

    let MySqlData = {
        "database": "YeikzyBot",
        "host": "127.0.0.1",
        "user": beta ? "root":"Yeikzy",
        "password": beta ? "":"Yeikzy040206"
    }

    const db = new mysql.createConnection(MySqlData);

    db.connect((error) => {
        if (error) throw error;

        db.query(`CREATE TABLE IF NOT EXISTS modules (guild_id VARCHAR(255) NOT NULL PRIMARY KEY)`, (er) => {if (er) throw er});
    });

    return db;
};