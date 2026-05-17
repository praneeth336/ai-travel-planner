const oracledb = require("oracledb");
require("dotenv").config();

async function connectDB() {
    try {

        const connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECTION_STRING
        });

        console.log("Oracle DB Connected");

        return connection;

    } catch(err) {
        console.log("DB Error:", err);
        throw err;
    }
}

module.exports = connectDB;