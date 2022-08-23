import { createConnection } from "mysql";
import db from './data/db.json';
import configs from './data/data.json';

const connectDb = () => {
    let data = configs.beta ? db.beta : db.prod;
    const database = createConnection(data);
    
    database.connect(error => {
        if (error) throw error;
    });
    
    return database;
};

export {
    connectDb
};