module.exports = {
  token: {
    // token密匙
    signKey: '123456',
    // 过期时间
    // signTime: 3600 * 24,
    signTime: 3600 * 24,
    // 请求头参数
    header: 'authorization',
    //不用校验的路由
    unRoute: [
      { url: '/user/login', methods: ['POST'] },
      { url: '/user/account', methods: ['POST'] },
      { url: '/user/register', methods: ['POST'] },
      { url: '/user/info', methods: ['POST'] },
      { url: '/user/password', methods: ['POST'] },
      { url: '/question', methods: ['GET'] },
      { url: '/user/question', methods: ['GET'] },
      { url: '/user/mark', methods: ['GET'] },
      { url: '/user', methods: ['GET'] },
      { url: '/user/delete', methods: ['POST'] },
      { url: '/question/type', methods: ['GET'] },
      { url: '/user/upload', methods: ['POST'] },
      { url: '/question/publish', methods: ['POST'] },
      { url: '/question/category', methods: ['GET'] },
      { url: '/question/search', methods: ['GET'] },
      { url: '/question/info', methods: ['GET'] },
      { url: '/question/query', methods: ['GET'] },
      { url: '/question/star', methods: ['POST'] },
      { url: '/question/mark', methods: ['POST'] },
      { url: '/question/answer', methods: ['GET'] },
      { url: '/question/answer/star', methods: ['POST'] },
      { url: '/question/view', methods: ['POST'] },
      { url: '/question/reply', methods: ['POST'] },
      { url: '/question/answer/delete', methods: ['POST'] },
      { url: '/question/answer/true', methods: ['POST'] },
      { url: '/question/answer/cancel', methods: ['POST'] },
      { url: '/question/delete', methods: ['POST'] },
      { url: '/questions/delete', methods: ['POST'] },
      { url: '/question/type', methods: ['POST'] },
      { url: '/question/new_type', methods: ['POST'] },
      { url: '/user/data', methods: ['GET'] },
    ]
  }
}