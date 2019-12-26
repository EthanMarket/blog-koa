module.exports = {
  port: process.env.PORT || 3000,
  session: {
    key: 'blogNode',
    maxAge: 86400000
  },
  mongodb: 'mongodb://localhost:27017/blogNode',
  TOKEN: {
    secret: 'firepage-blog', // secret is very important!
    expiresIn: '720h' // token 有效期
  }
};
