const express = require('express')
const md5 = require('md5')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const questionModel = require('../db/question')
const userModel = require('../db/user')


const connection = require('../db/db')
// 导入token校验文件
const verify = require('../token/verify')
const setting = require('../token/setting')

const { pageSize } = require('../db/config')

const { imgUploadPath, baseURL } = require('../config/index')

const router = express.Router()


// 配置上传文件的存储路径
const uploadImg = multer({
  dest: imgUploadPath
});


router.get('/isLogin', (req, res) => {
  res.json({
    status: 0,
    msg: 'success'
  })
})

// 用户登陆
router.post('/user/login', (req, res) => {
  const account = req.body.account
  const password = req.body.password
  const userType = req.body.userType
  const sql = `select * from user where account = '${account}' and password = '${md5(password)}' and user_tid = ${userType}`
  connection.query(sql, async function (err, row) {
    if (err) {
      return res.json({
        status: -1,
        msg: '网络异常，请稍后再试'
      })
    }
    if (row.length !== 1) {
      return res.json({
        status: -1,
        msg: '账号或密码错误',
      })
    }
    const token = await verify.setToken(account, password)
    return res.json({
      status: 0,
      msg: '登陆成功',
      data: {
        user_id: row[0].id,
        token,
        signTime: setting.token.signTime
      },
    })
  })
})

// 根据账号获取用户信息
router.post('/user/account', (req, res) => {
  const sql = `select * from user where account = '${req.body.account}'`
  connection.query(sql, async function (err, row) {
    if (err) {
      console.log(err)
      return res.json({
        status: -1,
        msg: 'error'
      })
    }
    return res.json({
      status: 0,
      msg: 'success',
      data: {
        user: row
      }
    })
  })
})

// 修改用户信息
router.post('/user/info', async (req, res) => {
  const user_id = req.body.user_id
  const avatar = req.body.avatar
  const name = req.body.name
  const sex = req.body.sex
  const email = req.body.email
  const detail = req.body.detail

  if (!user_id || !avatar || !name || !sex || !email || !detail) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }

  try {
    await userModel.updateUserInfo(user_id, avatar, name, sex, email, detail)
    return res.json({
      status: 0,
      msg: '修改成功'
    })
  } catch (err) {
    console.log(err)
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }


})

// 修改用户密码
router.post('/user/password', async (req, res) => {
  const old_password = req.body.old_password
  const new_password = req.body.new_password
  const user_id = req.body.user_id
  if (!old_password || !new_password || !user_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }

  try {
    const user = await userModel.getUserById(user_id)
    if (user.length === 0) {
      return res.json({
        status: -1,
        msg: '用户不存在'
      })
    }
    if (user[0].password !== md5(old_password)) {
      return res.json({
        status: -1,
        msg: '旧密码错误'
      })
    }
    const msg = await userModel.updateUserPassword(user_id, md5(new_password))
    console.log(msg)
    return res.json({
      status: 0,
      msg: '修改成功'
    })
  } catch (error) {
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }


})

// 用户注册
router.post('/user/register', async (req, res) => {
  const account = req.body.account
  const password = req.body.password
  const name = req.body.name
  const detail = req.body.detail
  const sex = req.body.sex
  const email = req.body.email
  const userType = req.body.userType

  try {
    const data = await userModel.getUserByAccount(account)
    if (data.length !== 0) {
      return res.json({
        status: -1,
        msg: '账号已存在'
      })
    }
  } catch (error) {
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
  if (account.length < 8 || account.length > 16) {
    return res.json({
      status: -1,
      msg: '账号不合法'
    })
  }
  if (password.length < 8 || password.length > 16) {
    return res.json({
      status: -1,
      msg: '密码不合法'
    })
  }
  if (name.length < 1 || name.length > 16) {
    return res.json({
      status: -1,
      msg: '昵称不合法'
    })
  }
  if (detail.length === 0) {
    return res.json({
      status: -1,
      msg: '个人简介不合法'
    })
  }
  if (!/[0-9a-zA-Z_]{0,19}@[0-9a-zA-Z]{1,13}\.[com,cn,net]{1,3}/.test(email)) {
    return res.json({
      status: -1,
      msg: '邮箱不合法'
    })
  }
  const sql = `insert into user (user_tid, account, password, username, detail, sex, email) values 
  ( ${userType ? '1' : '0'},'${account}','${md5(password)}','${name}', '${detail}', '${sex === '1' ? '男' : '女'}', '${email}')`
  connection.query(sql, async function (err, row) {
    if (err) {
      console.log(err)
      return res.json({
        status: -1,
        msg: '注册失败'
      })
    }
    return res.json({
      status: 0,
      msg: '注册成功',
      data: {
        register: true,
      }
    })
  })
})

// 获取问题
router.get('/question', (req, res) => {
  const pageNum = req.query.pageNum
  const type = req.query.type
  const category = req.query.category
  let sql_count = ''
  let sql_question = `SELECT question.q_id, question.u_id,question.question_tid,question.q_title,question.q_content,question.star_num,question.mark_num,question.view_num,question.reply_num,question.hot,question.q_time,question.resolve,
  user.username, question_type.type_name FROM question,user,question_type 
  WHERE question.u_id = user.id AND question_type.question_tid = question.question_tid `
  if (category) {
    sql_question += ` and question.question_tid = ${category} `
  }
  switch (type) {
    case 'new':
      sql_count = 'select count(*) as count from question'
      sql_question += ' ORDER BY q_time DESC '
      break;
    case 'hot':
      sql_count = 'select count(*) as count from question'
      sql_question += ' ORDER BY hot DESC '
      break;
    case 'unresolved':
      sql_count = 'select count(*) as count from question where resolve = 0'
      sql_question += ' and resolve = 0 '
      break;
    case 'resolved':
      sql_count = 'select count(*) as count from question where resolve = 1'
      sql_question += ' and resolve = 1 '
      break;
    case 'wait':
      sql_count = 'select count(*) as count from question where reply_num = 0'
      sql_question += ' and reply_num = 0 '
      break;
    default:
      return res.json({
        status: -1,
        msg: '参数错误'
      })
  }

  if (category) {
    if (sql_count.indexOf('where') !== -1) {
      sql_count += ` and question_tid = ${category} `
    } else {
      sql_count += ` where question_tid = ${category} `
    }
  }
  connection.query(sql_count, async function (err, row) {
    if (err) {
      console.log(err)
      return res.json({
        status: -1,
        msg: '获取失败'
      })
    }
    const pageCount = Math.ceil(row[0].count / pageSize)
    if (pageCount !== 0 && (pageNum > pageCount || pageNum < 1)) {
      return res.json({
        status: -1,
        msg: '页码错误',
      })
    }
    sql_question += ` LIMIT ${((pageNum - 1) * pageSize)}, ${(pageSize * pageNum) > pageCount ? (pageSize * pageNum) : pageCount}`
    connection.query(sql_question, (err, row) => {
      if (err) {
        console.log(err)
        return res.json({
          status: -1,
          msg: '未知错误'
        })
      }
      return res.json({
        status: 0,
        msg: 'success',
        data: {
          pageCount,
          question_list: row
        }
      })
    })
  })
})

// 获取问题类型
router.get('/question/type', (req, res) => {
  questionModel.getQuestionType().then(row => {
    return res.json({
      status: 0,
      msg: 'success',
      data: {
        question_type: row
      }
    })
  }).catch(err => {
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  })
})

// 用户发布问题
router.post('/question/publish', (req, res) => {
  const title = req.body.title || ''
  const content = req.body.content || ''
  const type = req.body.type
  const user_id = req.body.user_id
  let errMsg = ''
  if (title.length < 1 || title.length > 30) {
    errMsg = '标题格式错误 '
  }
  questionModel.getQuestionType().then(row => {
    let has = false
    for (let key in row) {
      if (row[key].question_tid == type) {
        has = true
      }
    }
    if (!has) {
      errMsg += '问题类型不存在 '
    }
    userModel.getUserById(user_id).then(row => {
      if (row.length === 0) errMsg += '用户id不存在'
      if (errMsg.length > 0) {
        return res.json({
          status: -1,
          msg: errMsg
        })
      }
      questionModel.publishQuestion(user_id, type, title, content).then(row => {
        res.json({
          status: 0,
          msg: '发布成功'
        })
      }).catch(err => {
        return res.json({
          status: -1,
          msg: '发布失败'
        })
      })
    }).catch(err => {
      return res.json({
        status: -1,
        msg: '用户异常'
      })
    })
  }).catch(err => {
    return res.json({
      status: -1,
      msg: '问题类型异常'
    })
  })
})

// 用户上传
router.post('/user/upload', uploadImg.single('file'), (req, res) => {
  if (req.file) {
    let file = req.file;
    let newName = file.path + (path.parse(file.originalname).ext);  //修改path
    fs.rename(file.path, newName, (err) => {   //修改path
      if (err) {
        return res.json({
          status: -1,
          msg: '上传失败'
        })
      }
      return res.json({
        status: 0,
        msg: '上传成功',
        data: {
          title: path.parse(file.originalname).name,
          imgUrl: baseURL + imgUploadPath + file.filename + path.parse(file.originalname).ext
        }
      })
    })
  } else {
    return res.json({
      status: -1,
      msg: '上传失败'
    })
  }
})

// 获取问题分区
router.get('/question/category', (req, res) => {
  questionModel.getQuestionCategory().then(row => {
    res.json({
      status: 0,
      msg: 'success',
      data: {
        category: row
      }
    })
  }).catch(err => {
    res.json({
      status: -1,
      msg: '未知错误'
    })
  })
})

// 搜索问题
router.get('/question/search', (req, res) => {
  const key = req.query.key
  const pageNum = req.query.pageNum
  if (key.trim() === '') {
    return res.json({
      status: -1,
      msg: '搜索关键字不能为空'
    })
  }
  questionModel.getQuestionCountByKey(key).then(row => {
    if (row.length !== 1) {
      return res.json({
        status: -1,
        msg: '未知错误'
      })
    }
    const pageCount = Math.ceil(row[0].count / pageSize)
    questionModel.getQuestionByKey(key, pageNum, pageSize).then(row => {
      if (pageCount !== 0 && (pageNum < 1 || pageNum > pageCount)) {
        return res.json({
          status: -1,
          msg: '页码错误'
        })
      }
      return res.json({
        status: 0,
        msg: 'success',
        data: {
          pageCount,
          res: row
        }
      })
    }).catch(err => {
      console.log(err)
      return res.json({
        status: -1,
        msg: '未知错误'
      })
    })
  })
})
// 获取用户问题
router.get('/user/question', (req, res) => {
  const user_id = req.query.user_id
  const pageNum = req.query.pageNum
  if (!user_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  userModel.getQuestionCountById(user_id).then(row => {
    if (row.length !== 1) {
      return res.json({
        status: -1,
        msg: '未知错误'
      })
    }
    const pageCount = Math.ceil(row[0].count / pageSize)
    userModel.getQuestionById(user_id, pageNum, pageSize).then(row => {
      if (pageCount !== 0 && (pageNum < 1 || pageNum > pageCount)) {
        return res.json({
          status: -1,
          msg: '页码错误'
        })
      }
      return res.json({
        status: 0,
        msg: 'success',
        data: {
          pageCount,
          res: row
        }
      })
    }).catch(err => {
      console.log(err)
      return res.json({
        status: -1,
        msg: '未知错误'
      })
    })
  })
})
// 获取用户标注问题
router.get('/user/mark', (req, res) => {
  const user_id = req.query.user_id
  const pageNum = req.query.pageNum
  if (!user_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  userModel.getUserMarkCount(user_id).then(row => {
    if (row.length !== 1) {
      return res.json({
        status: -1,
        msg: '未知错误'
      })
    }
    const pageCount = Math.ceil(row[0].count / pageSize)
    userModel.getUserMarkQuestion(user_id, pageNum, pageSize).then(row => {
      if (pageCount !== 0 && (pageNum < 1 || pageNum > pageCount)) {
        return res.json({
          status: -1,
          msg: '页码错误'
        })
      }
      return res.json({
        status: 0,
        msg: 'success',
        data: {
          pageCount,
          res: row
        }
      })
    }).catch(err => {
      console.log(err)
      return res.json({
        status: -1,
        msg: '未知错误'
      })
    })
  })
})

// 删除用户
router.post('/user/delete', async (req, res) => {
  const ids = req.body.ids || []
  try {
    await userModel.deleteUsers(ids)
    await userModel.deleteUserAnswerStars(ids)
    await userModel.deleteUserAnswers(ids)
    await userModel.deleteUserMarks(ids)
    await userModel.deleteUserQuestionStars(ids)
    await userModel.deleteUserQuestions(ids)
    return res.json({
      status: 0,
      msg: '删除成功'
    })
  } catch (error) {
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})

// 获取问题信息
router.get('/question/info', (req, res) => {
  const user_id = req.query.user_id
  const q_id = req.query.q_id
  if (!q_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }

  questionModel.getQuestionById(q_id).then(question => {
    if (question.length !== 1) {
      return res.json({
        status: -1,
        msg: '未知错误'
      })
    }
    if (!user_id) {
      return res.json({
        status: 0,
        msg: '获取成功',
        data: {
          question,
        },
        star: false,
        mark: false
      })
    }
    userModel.getUserStar(user_id, q_id).then(star => {
      userModel.getUserMark(user_id, q_id).then(mark => {
        return res.json({
          status: 0,
          msg: '获取成功',
          data: {
            question,
            star: star.length === 1,
            mark: mark.length === 1
          }
        })
      }).catch(err => {
        console.log(err1)
        res.json({
          status: -1,
          msg: '未知错误'
        })
      })
    }).catch(err => {
      res.json({
        status: -1,
        msg: '未知错误'
      })
    })
  }).catch(err => {
    console.log(err)
    res.json({
      status: -1,
      msg: '未知错误'
    })
  })
})


// 点赞问题
router.post('/question/star', (req, res) => {
  const user_id = req.body.user_id
  const q_id = req.body.q_id
  let star = req.body.star
  if (!user_id || !q_id || typeof star === 'undefined') {
    res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  questionModel.starQuestion(user_id, q_id, star).then(row => {

    questionModel.changeStarNum(q_id, star).then(row => {
      res.json({
        status: 0,
        msg: 'success'
      })
    }).catch(err => {
      console.log(err)
      res.json({
        status: -1,
        msg: '未知错误'
      })
    })

  }).catch(err => {
    console.log(err)
    res.json({
      status: -1,
      msg: '未知错误'
    })
  })


})
// 标注问题
router.post('/question/mark', (req, res) => {
  const user_id = req.body.user_id
  const q_id = req.body.q_id
  let mark = req.body.mark
  if (!user_id || !q_id || typeof mark === 'undefined') {
    res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  questionModel.markQuestion(user_id, q_id, mark).then(row => {

    questionModel.changeMarkNum(q_id, mark).then(row => {
      res.json({
        status: 0,
        msg: 'success'
      })
    }).catch(err => {
      console.log(err)
      res.json({
        status: -1,
        msg: '未知错误'
      })
    })

  }).catch(err => {
    console.log(err)
    res.json({
      status: -1,
      msg: '未知错误'
    })
  })


})
// 删除问题
router.post('/question/delete', async (req, res) => {
  const user_id = req.body.user_id
  const q_id = req.body.q_id
  if (!user_id || !q_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  try {
    await questionModel.deleteQuestionById(q_id, user_id)
    await questionModel.starQuestion(user_id, q_id, false)
    await questionModel.deleteMarkById(q_id, user_id)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (error) {
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})
// 获取问题的答案
router.get('/question/answer', async (req, res) => {
  const q_id = req.query.q_id
  const user_id = req.query.user_id
  if (!q_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }

  try {
    const answerList = await questionModel.getAnswerById(q_id)
    let starList = []
    if (user_id) {
      starList = await userModel.getAStar(user_id, q_id)
    }
    const mapStar = new Map()
    for (let i in starList) {
      mapStar.set(starList[i].a_id, true)
    }
    for (let i in answerList) {
      if (mapStar.get(answerList[i].a_id) === true) {
        answerList[i].star = true
      } else {
        answerList[i].star = false
      }
    }
    return res.json({
      status: 0,
      msg: '获取成功',
      data: {
        answerList
      }
    })
  } catch (error) {
    console.log(error)
    res.json({
      status: -1,
      msg: '未知错误'
    })
  }


})

// 答案点赞
router.post('/question/answer/star', async (req, res) => {
  const a_id = req.body.a_id
  const user_id = req.body.user_id
  const q_id = req.body.q_id
  let star = req.body.star
  if (!user_id || !q_id || typeof star === 'undefined') {
    res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  try {
    await questionModel.starAnswer(user_id, q_id, a_id, star)
    await questionModel.changeAnswerNum(a_id, star)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (error) {
    res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})

// 问题浏览
router.post('/question/view', async (req, res) => {
  const q_id = req.body.q_id
  if (!q_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  try {
    questionModel.changeQuestionView(q_id)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (error) {
    res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})

// 问题回答
router.post('/question/reply', async (req, res) => {
  const user_id = req.body.user_id
  const q_id = req.body.q_id
  const content = req.body.content
  if (!user_id || !q_id || !content) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }

  try {
    await questionModel.replyQuestion(user_id, q_id, content)
    await questionModel.changeReplyQuestionNum(q_id, true)
    res.json({
      status: 0,
      msg: '回答成功'
    })
  } catch (error) {
    res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})

// 删除答案
router.post('/question/answer/delete', async (req, res) => {
  const user_id = req.body.user_id
  const a_id = req.body.a_id
  const q_id = req.body.q_id
  const best_answer = req.body.best_answer
  if (!user_id || !a_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  try {
    await questionModel.deleteAnswer(a_id, user_id)
    await questionModel.changeQuestionResolve(user_id, q_id, !best_answer)
    await questionModel.changeReplyQuestionNum(q_id, false)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (error) {
    return res.json({
      status: -1,
      msg: '删除失败'
    })
  }
})

// 设置正确答案
router.post('/question/answer/true', async (req, res) => {
  const user_id = req.body.user_id
  const q_id = req.body.q_id
  const a_id = req.body.a_id
  if (!user_id || !user_id || !a_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }

  try {
    await questionModel.changeQuestionResolve(user_id, q_id, true)
    await questionModel.changeAnswerResolve(q_id, false)
    await questionModel.changeAnswerResolveById(a_id, true)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (error) {
    console.log(error)
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }

})

// 取消正确答案
router.post('/question/answer/cancel', async (req, res) => {
  const user_id = req.body.user_id
  const q_id = req.body.q_id
  const a_id = req.body.a_id
  if (!user_id || !user_id || !a_id) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }

  try {
    await questionModel.changeQuestionResolve(user_id, q_id, false)
    await questionModel.changeAnswerResolve(q_id, false)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (error) {
    console.log(error)
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }

})

// 获取用户
router.get('/user', async (req, res) => {
  const account = req.query.account
  const username = req.query.username
  const userType = req.query.userType
  const pageNum = parseInt(req.query.pageNum)
  if (pageNum.toString() === 'NaN') {
    return res.json({
      status: -1,
      msg: '页码错误'
    })
  }
  try {
    const row = await userModel.getUserCount(account, username, userType)
    const pageCount = Math.ceil(row[0].count / pageSize)
    if (pageCount !== 0 && (pageNum < 1 || pageNum > pageCount)) {
      return res.json({
        status: -1,
        msg: '页码错误'
      })
    }
    const user = await userModel.getUser(account, username, userType, pageNum, pageSize)
    return res.json({
      status: 0,
      msg: 'success',
      data: {
        pageCount,
        user
      }
    })
  } catch (err) {
    console.log(err)
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})

// 获取question
router.get('/question/query', async (req, res) => {
  const id = req.query.id
  const username = req.query.username
  const t_id = req.query.t_id
  const title = req.query.title
  const pageNum = parseInt(req.query.pageNum)
  if (pageNum.toString() === 'NaN') {
    return res.json({
      status: -1,
      msg: '页码错误'
    })
  }
  try {
    const row = await questionModel.getQuestionCount(id, username, t_id, title)
    const pageCount = Math.ceil(row[0].count / pageSize)
    if (pageCount !== 0 && (pageNum < 1 || pageNum > pageCount)) {
      return res.json({
        status: -1,
        msg: '页码错误'
      })
    }
    const question = await questionModel.queryQuestion(id, username, t_id, title, pageNum, pageSize)
    return res.json({
      status: 0,
      msg: 'success',
      data: {
        pageCount,
        question
      }
    })
  } catch (err) {
    console.log(err)
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})

router.post('/questions/delete', async (req, res) => {
  const ids = req.body.ids
  try {
    await questionModel.deleteQuestions(ids)
    await questionModel.deleteQuestionStars(ids)
    await questionModel.deleteQuestionMarks(ids)
    await questionModel.deleteQuestionAnswers(ids)
    await questionModel.deleteQuestionAnswerStars(ids)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (err) {
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})

// 更新type名字
router.post('/question/type', async (req, res) => {
  const type_name = req.body.type_name
  const question_tid = req.body.question_tid
  console.log(type_name)
  console.log(question_tid)
  if (typeof type_name !== 'string' || type_name.length < 2 || type_name.length > 10 || !question_tid) {
    return res.json({
      status: -1,
      msg: '参数错误'
    })
  }
  try {
    await userModel.updateType(question_tid, type_name)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (error) {
    console.log(err)
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }

})

// 创建新type
router.post('/question/new_type', async (req, res) => {
  const type_name = req.body.type_name
  if (typeof type_name !== 'string' || type_name.length < 2 || type_name.length > 10) {
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
  try {
    await userModel.createType(type_name)
    return res.json({
      status: 0,
      msg: 'success'
    })
  } catch (error) {
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})

// 获取用户近七日数据
router.get('/user/data', async (req, res) => {
  try {
    const userData = await userModel.getUserDataByWeek()
    const questionData = await userModel.getQuestionDataByWeek()
    return res.json({
      status: 0,
      msg: 'success',
      data: {
        userData,
        questionData
      }
    })
  } catch (error) {
    console.log(error)
    return res.json({
      status: -1,
      msg: '未知错误'
    })
  }
})



module.exports = router