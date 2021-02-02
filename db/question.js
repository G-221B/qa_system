const connection = require('./db')

module.exports = {
  // 获取问题的所有分类
  getQuestionType () {
    const sql = 'select * from question_type'
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
  // 发布新问题
  publishQuestion (u_id, t_id, title, content) {
    u_id = parseInt(u_id)
    t_id = parseInt(t_id)
    const sql = `insert into question (u_id, question_tid,q_title,q_content) values (${u_id}, ${t_id}, '${title}', '${content ? content : ''}')`
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
  // 获取问题的类型以及各个的数量
  getQuestionCategory () {
    const sql = `SELECT question_type.question_tid,type_name, COUNT(*)  AS count  
    FROM question, question_type 
    WHERE question_type.question_tid = question.question_tid 
    GROUP BY question_type.question_tid`
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
  // 通过关键字来搜索问题的数量
  getQuestionCountByKey (key) {
    const sql = `select count(*) as count from question where q_title like '%${key}%'`
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
  // 通过关键字来搜索问题
  getQuestionByKey (key, pageNum, pageSize) {
    const sql = `
    SELECT question.q_id, question.u_id,question.question_tid,question.q_title,question.q_content,question.star_num,question.mark_num,question.view_num,question.reply_num,question.hot,question.q_time,question.resolve,
    user.username, question_type.type_name FROM question,user,question_type 
    WHERE question.u_id = user.id AND question_type.question_tid = question.question_tid AND question.q_title LIKE '%${key}%' LIMIT ${pageSize * (pageNum - 1)},${pageSize}`
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
  // 根据id来获取问题详情
  getQuestionById (id) {
    const sql = `SELECT question.q_id, question.u_id,question.question_tid,question.q_title,question.q_content,question.star_num,question.mark_num,question.view_num,question.reply_num,question.hot,question.q_time,question.resolve,
    user.username, question_type.type_name 
    FROM question,user,question_type
    WHERE question.u_id = user.id AND question_type.question_tid = question.question_tid AND question.q_id = ${id}`
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
  // 改变问题点赞数
  changeStarNum (id, star) {
    const sql = `
    UPDATE question 
    SET star_num = star_num ${star ? '+' : '-'} 1, q_time=q_time, hot = FLOOR(star_num * 0.4 + mark_num * 0.4 + view_num *0.2) 
    WHERE q_id = ${id}
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
  // 点赞问题
  starQuestion (user_id, q_id, star) {
    let sql = `
    insert into q_star (u_id, q_id) values (${user_id}, ${q_id}) 
    `
    if (!star) {
      sql = `
        delete from q_star where q_id = ${q_id} and u_id = ${user_id}
      `
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
  // 改变问题标注数
  changeMarkNum (id, mark) {
    const sql = `
    UPDATE question 
    SET mark_num = mark_num ${mark ? '+' : '-'} 1,q_time = q_time, hot = FLOOR(mark_num * 0.4 + mark_num * 0.4 + view_num *0.2) 
    WHERE q_id = ${id}
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
  // 标注问题
  markQuestion (user_id, q_id, mark) {
    let sql = `
    insert into mark (u_id, q_id) values (${user_id}, ${q_id}) 
    `
    if (!mark) {
      sql = `
        delete from mark where q_id = ${q_id} and u_id = ${user_id}
      `
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
  // 根据问题id获取所有的答案
  getAnswerById (id) {
    const sql = `SELECT answer.resolve,answer.a_id,answer.u_id,answer.q_id,answer.a_content,answer.a_time,answer.star_num,user.username,user.avatar
    FROM answer,user
    WHERE q_id = ${id} AND user.id = answer.u_id`
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
  // 点赞回答
  starAnswer (user_id, q_id, a_id, star) {
    let sql = `
      insert into a_star (a_id, u_id, q_id) values (${a_id}, ${user_id}, ${q_id})
    `
    if (!star) {
      sql = `
        delete from a_star where a_id = ${a_id} and u_id = ${user_id} and q_id = ${q_id}
      `
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
  // 增加回答点赞数
  changeAnswerNum (id, star) {
    const sql = `
    update answer set star_num = star_num ${star ? '+' : '-'} 1 , a_time = a_time where a_id = ${id} 
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
  // 增加浏览量
  changeQuestionView (id) {
    const sql = `UPDATE question SET view_num = view_num + 1,q_time = q_time WHERE q_id = ${id}`
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
  // 回复问题
  replyQuestion (user_id, q_id, content) {
    const sql = `INSERT INTO answer (u_id,q_id,a_content) VALUES (${user_id}, ${q_id}, '${content}')`
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
  // 增加回复量
  changeReplyQuestionNum (id, flag) {
    const sql = `update question set reply_num = reply_num ${flag ? '+' : '-'} 1, q_time = q_time where q_id = ${id}`
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
  // 删除回答
  deleteAnswer (a_id, u_id) {
    const sql = `
      delete from answer where a_id = ${a_id} and u_id = ${u_id}
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

  // 改变问题的正确回答状态
  changeQuestionResolve (user_id, q_id, flag) {
    const sql = `
      update question set resolve = ${flag ? 1 : 0},q_time = q_time where q_id = ${q_id} and u_id = ${user_id}
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
  // 改变答案的正确表示
  changeAnswerResolve (q_id, flag) {
    const sql = `
      update answer set resolve = ${flag ? 1 : 0},a_time = a_time where q_id = ${q_id}
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
  // 通过id来改变答案的正确表示
  changeAnswerResolveById (a_id, flag) {
    const sql = `
      update answer set resolve = ${flag ? 1 : 0},a_time = a_time where a_id = ${a_id}
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
  // 通过q_id和用户id来删除question
  deleteQuestionById (q_id, user_id) {
    let sql = `
      delete from question where q_id = ${q_id}
    `
    if (user_id) {
      sql += ` and u_id = ${user_id}`
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
  // 通过q_id和用户id来删除mark
  deleteMarkById (q_id, user_id) {
    let sql = `
      delete from mark where q_id = ${q_id}
    `
    if (user_id) {
      sql += ` and u_id = ${user_id}`
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
  // 通过条件来查询问题
  queryQuestion (id, username, t_id, title, pageNum, pageSize) {
    let sql = `
    SELECT question.q_id,user.username ,question_type.type_name,question.q_title,question.q_time,question.q_content 
    FROM user, question,question_type 
    WHERE user.id= question.u_id AND question_type.question_tid = question.question_tid
    `
    if (id) {
      sql += ` and question.q_id = ${id}`
    }
    if (username) {
      sql += ` and user.username like '%${username}%'`
    }
    if (t_id) {
      sql += ` and question.question_tid = ${t_id}`
    }
    if (title) {
      sql += ` and question.q_title like '%${title}%'`
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
  // 通过条件来获取问题的数量
  getQuestionCount (id, username, t_id, title) {
    let sql = `
    SELECT count(*) as count
    FROM user, question,question_type 
    WHERE user.id= question.u_id AND question_type.question_tid = question.question_tid
    `
    if (id) {
      sql += ` and question.q_id = ${id}`
    }
    if (username) {
      sql += ` and user.username like '%${username}%'`
    }
    if (t_id) {
      sql += ` and question.question_tid = ${t_id}`
    }
    if (title) {
      sql += ` and question.q_title like '%${title}%'`
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
  //删除问题
  deleteQuestions (ids) {
    if (!ids.length) return
    let sql = 'delete from question where '
    ids.forEach(id => {
      sql += ` q_id = ${id} OR`
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
  deleteQuestionStars (ids) {
    if (!ids.length) return
    let sql = 'delete from q_star where '
    ids.forEach(id => {
      sql += ` q_id = ${id} OR`
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
  deleteQuestionMarks (ids) {
    if (!ids.length) return
    let sql = 'delete from mark where '
    ids.forEach(id => {
      sql += ` q_id = ${id} OR`
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
  deleteQuestionAnswers (ids) {
    if (!ids.length) return
    let sql = 'delete from answer where '
    ids.forEach(id => {
      sql += ` q_id = ${id} OR`
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
  deleteQuestionAnswerStars (ids) {
    if (!ids.length) return
    let sql = 'delete from a_star where '
    ids.forEach(id => {
      sql += ` q_id = ${id} OR`
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
  }
}