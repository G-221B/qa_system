const connection = require('./db')
const question = require('./question')
module.exports = {
  // 根据用户id获取用户信息
  getUserById (id) {
    const sql = `select * from user where id = ${id}`
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 根据用户账户来获取用户信息
  getUserByAccount (account) {
    const sql = 'select * from user where account = ' + account
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 获取用户点赞问题记录
  getUserStar (id, q_id) {
    let sql = `SELECT * FROM q_star WHERE u_id = ${id}`
    if (q_id) {
      sql += ` and q_id = ${q_id}`
    }
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 获取用户标注问题记录
  getUserMark (id, q_id) {
    let sql = `SELECT * FROM mark WHERE u_id = ${id}`
    if (q_id) {
      sql += ` and q_id = ${q_id}`
    }
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 获取用户某个问题的答案点赞记录
  getAStar (user_id, q_id) {
    const sql = `SELECT * FROM a_star WHERE u_id = ${user_id} AND q_id = ${q_id}`
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 更新用户信息
  updateUserInfo (user_id, avatar, name, sex, email, detail) {
    const sql = `
      update user
      set avatar = '${avatar}',username = '${name}', sex = '${sex}', email = '${email}', detail = '${detail}',create_time = create_time
      where id = ${user_id}
    `
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 更新用户密码
  updateUserPassword (user_id, password) {
    const sql = `
      update user set password = '${password}',create_time = create_time where id = ${user_id}
    `
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 通过id来获取问题
  getQuestionById (user_id, pageNum, pageSize) {
    const sql = `
      SELECT question.q_id, question.u_id,question.question_tid,question.q_title,question.q_content,question.star_num,question.mark_num,question.view_num,question.reply_num,question.hot,question.q_time,question.resolve,
      user.username, question_type.type_name FROM question,user,question_type 
      WHERE question.u_id = user.id AND question_type.question_tid = question.question_tid AND question.u_id = ${user_id} ORDER BY question.q_time DESC LIMIT ${pageSize * (pageNum - 1)},${pageSize} `
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 通过id来获取问题的数量
  getQuestionCountById (user_id) {
    const sql = `select count(*) as count from question where u_id = ${user_id}`
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 通过id来获取标注问题
  getUserMarkQuestion (user_id, pageNum, pageSize) {
    const sql = `
      SELECT question.q_id, question.u_id,question.question_tid,question.q_title,question.q_content,question.star_num,question.mark_num,question.view_num,question.reply_num,question.hot,question.q_time,question.resolve,
      user.username, question_type.type_name FROM question,user,question_type,mark
      WHERE question.u_id = mark.u_id and mark.u_id = user.id AND question.u_id = user.id AND question_type.question_tid = question.question_tid AND question.u_id = ${user_id} AND question.q_id = mark.q_id LIMIT ${pageSize * (pageNum - 1)},${pageSize}`
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 通过id来获取问题的数量
  getUserMarkCount (user_id) {
    const sql = `select count(*) as count from mark where u_id = ${user_id}`
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 根据条件来获取用户信息
  getUser (account, username, userType, pageNum, pageSize) {
    let sql = `select id,user_tid,account,username,email,sex,create_time from user`
    if (account || username || userType === '0' || userType === '1') {
      sql += ' where '
    }
    if (account) {
      sql += ` account = ${account} and`
    }
    if (username) {
      sql += ` username LIKE '%${username}%' and`
    }
    if (userType === '0' || userType === '1') {
      sql += ` user_tid = ${userType}`
    }
    if (sql.slice(-3) === 'and') {
      sql = sql.slice(0, -3)
    }
    sql += ` LIMIT ${pageSize * (pageNum - 1)},${pageSize}`
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 获取用户数
  getUserCount (account, username, userType) {
    let sql = `select count(*) as count from user`
    if (account || username || userType === '0' || userType === '1') {
      sql += ' where '
    }
    if (account) {
      sql += ` account = ${account} and`
    }
    if (username) {
      sql += ` username LIKE '%${username}%' and`
    }
    if (userType === '0' || userType === '1') {
      sql += ` user_tid = ${userType}`
    }
    if (sql.slice(-3) === 'and') {
      sql = sql.slice(0, -3)
    }
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 删除用户
  deleteUsers (ids) {
    if (!ids.length) return
    let sql = 'delete from user where '
    ids.forEach(id => {
      sql += ` id = ${id} OR`
    })
    sql = sql.slice(0, -2)
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  deleteUserAnswerStars (ids) {
    if (!ids.length) return
    let sql = 'delete from a_star where '
    ids.forEach(id => {
      sql += ` u_id = ${id} OR`
    })
    sql = sql.slice(0, -2)
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  deleteUserAnswers (ids) {
    if (!ids.length) return
    let sql = 'delete from answer where '
    ids.forEach(id => {
      sql += ` u_id = ${id} OR`
    })
    sql = sql.slice(0, -2)
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  deleteUserMarks (ids) {
    if (!ids.length) return
    let sql = 'delete from mark where '
    ids.forEach(id => {
      sql += ` u_id = ${id} OR`
    })
    sql = sql.slice(0, -2)
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  deleteUserQuestionStars (ids) {
    if (!ids.length) return
    let sql = 'delete from q_star where '
    ids.forEach(id => {
      sql += ` u_id = ${id} OR`
    })
    sql = sql.slice(0, -2)
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  deleteUserQuestions (ids) {
    if (!ids.length) return
    let sql = 'delete from question where '
    ids.forEach(id => {
      sql += ` u_id = ${id} OR`
    })
    sql = sql.slice(0, -2)
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 创建分区
  createType (type_name) {
    const sql = `insert into question_type (type_name) values ('${type_name}')`
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 更新分区名
  updateType (question_tid, type_name) {
    const sql = `update question_type set type_name = '${type_name}', create_time = create_time where question_tid = ${question_tid}`
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 获取用户一周注册量
  getUserDataByWeek () {
    const sql = `
    SELECT DATE_FORMAT(create_time,'%d') AS date, COUNT(1) AS count
    FROM user
    WHERE create_time >= DATE(NOW()) - INTERVAL 6 DAY GROUP BY DAY(create_time)
    `
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },
  // 获取用户一周提问量
  getQuestionDataByWeek () {
    const sql = `
    SELECT DATE_FORMAT(q_time,'%d') AS date, COUNT(1) AS count
    FROM question
    WHERE q_time >= DATE(NOW()) - INTERVAL 6 DAY GROUP BY DAY(q_time)
    `
    return new Promise((resolve, reject) => {
      connection.query(sql, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }
}