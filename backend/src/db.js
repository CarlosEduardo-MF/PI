// db.js
// Cria a conexão (pool) com o banco de dados MySQL.
// Usamos o pacote "mysql2" e as queries são feitas com SQL puro (não usamos ORM).
// As credenciais ficam no arquivo .env.

require("dotenv").config();
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "connected_woman",
  waitForConnections: true,
  connectionLimit: 10,
});

// Exporta a versão com Promise, para usarmos async/await: await pool.query(...)
module.exports = pool.promise();
