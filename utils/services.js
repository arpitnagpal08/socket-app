require('dotenv').config();

const jwt = require("jsonwebtoken");
const secret_key = process.env.SECRET_KEY;

exports.submitData                  = submitData;
exports.decodeSessionToken          = decodeSessionToken;

function submitData(obj) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO ?? (??) VALUES ( `;

    for(let i = 0; i < obj.fields.length; i++) {
      sql += `?, `;
    }
    
    let query = sql.slice(0, sql.length-2).concat(" )");
    let db = con.query(query, [obj.table, obj.fields, obj.values.user_id, obj.values.message], (error, message) => {
      if(error) reject(error);
      else resolve(message);
    })
  })
}

function decodeSessionToken(token) {
  // token decode
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret_key, (error, result) => {
      if(error) reject(error);
      else {
        return resolve(result);
      }
    });
  })
}