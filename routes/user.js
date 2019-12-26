
const router = require('koa-router')();
router.prefix('');
const {
  login,
  loginAdmin,
  currentUser,
  register,
  getUserList,
  deleteUser,
  updateUser,
  logout,
  getUserDetail
} = require('../src/controllers/User')
router
  .post('/login', login)// 用户登录
  .post('/loginAdmin', loginAdmin)
  .post('/getUserDetail', getUserDetail)
  .get('/currentUser', currentUser)
  .post('/register', register)
  .get('/getUserList', getUserList)
  .post('/delUser', deleteUser)
  .post('/updateUser', updateUser)
  .post('/logout', logout)
module.exports = router;
