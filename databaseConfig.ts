import mysql, { Connection } from "mysql";

const dbConnection: Connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'full_stack_demo'
});

export default dbConnection;