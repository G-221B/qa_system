const express = require('express')
const bodyParser = require('body-parser')
const expressJWT = require('express-jwt')
const router = require('./router/index')
const path = require('path')
const verify = require('./token/verify')

// 导入配置文件
const setting = require('./token/setting')

const app = express()

// 使用bodyParser解析post请求传递的参数
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/public', express.static(path.join(__dirname, 'public')))

// 跨域配置
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*')
  res.append('Access-Control-Allow-Origin-Type', '*')
  res.header("Access-Control-Allow-Methods", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
})

// app.use(function (req, res, next) {
//   var token = req.headers['authorization'];
//   if (token == undefined) {
//     return next();
//   } else {
//     vertoken.getToken(token).then((data) => {
//       req.data = data;
//       return next();
//     }).catch((error) => {
//       return next();
//     })
//   }
// })

// 使用expressJWT 验证token是否过期
app.use(expressJWT({
  secret: setting.token.signKey, // 签名的密钥 或 PublicKey
  algorithms: ['HS256']
}).unless({ // 设置并规定哪些路由不用验证 token
  path: [
    '/user/login', // 用户登陆
    // '/user/account', // 获取用户详情
    '/user/register', // 用户注册
    // '/user/info', // 修改用户信息
    // '/user/password', // 修改用户密码
    // '/user/question', // 获取用户的问题
    // '/user/mark', // 获取用户标注问题
    // '/user', 获取用户
    // '/user/delete',  // 删除用户
    '/question',  // 获取问题
    // '/question/query', // 查询问题
    '/question/type', // 获取问题的分类
    // '/user/upload', // 上传资源
    // '/question/publish', // 发布问题
    '/question/category', // 获取问题分类
    '/question/search', // 问题搜索
    '/question/info', // 获取问题详情
    // '/question/star',// 点赞问题
    // '/question/mark', // 标注问题
    '/question/answer', // 获取问题答案
    // '/question/answer/star', // 答案点赞
    '/question/view', // 问题浏览
    // '/question/reply', // 问题回复
    // '/question/answer/delete', // 答案删除
    // '/question/answer/true', // 设为正确答案
    // '/question/answer/cancel', // 取消设为争取答案
    // '/question/delete', //删除单个问题
    // '/questions/delete', // 删除多条问题
    // '/question/type', // 分区改名
    // '/question/new_type', // 创建新分区
    // '/user/data' // 获取系统七天的数据
  ] // 指定路径不经过 Token 解析
}))





app.use(router)

// 当token失效返回提示信息，时间过期了执行这一条
app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.json({
      status: err.status,
      msg: 'token失效',
      error: err.name + ":" + err.message
    })
  }
})


app.listen(3001, () => {
  console.log('本地服务 localhost: 3001')
})