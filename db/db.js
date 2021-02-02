const mysql = require('mysql')
const { dbConfig } = require('./config')

let connection = mysql.createConnection(dbConfig)
connection.connect((err) => {
  if (err) {
    return console.log('err')
  }
  console.log('数据库连接成功')
})

module.exports = connection