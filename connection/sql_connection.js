require('dotenv').config();
const mysql = require('mysql');

global.con = mysql.createPool({
  connectionLimit: 10,
  queueLimit: 10, 
  host : process.env.SQL_HOST,
  user : process.env.SQL_USER,
  password : process.env.SQL_PASSWORD,
  database : process.env.SQL_DATABASE
});

const connection = async () => {
  try {
    await con.on('connection', (connection) => {
      console.log("Connected to database.");
    });
    
    await con.on('error', function(err) {
      console.log('db error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
        connection();                               // lost due to either server restart, or a
      } else {                                      // connnection idle timeout (the wait_timeout
        throw err;                                  // server variable configures this)
      }
    });

    await con.on('enqueue', function () {
      console.log('Waiting for available connection slot');
    });
    
    await con.on('acquire', function (connection) {
      console.log('Connection %d acquired', connection.threadId);
    });

    await con.on('release', function (connection) {
      console.log('Connection %d released', connection.threadId);
    });

    await con.query(`create database if not exists ${process.env.SQL_DATABASE}`);
    await con.query(`use ${process.env.SQL_DATABASE}`);
    
  } catch (error) {
    console.log("Error in connecting to database");
    return error;
  }
}

module.exports = connection;