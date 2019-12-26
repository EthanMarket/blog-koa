
const router = require('koa-router')();
router.prefix('');
const {
  getLinkList,
  addLink,
  deleteLink,
  updateLink,
  getLinkDetail
} = require('../src/controllers/FriendLinks')
router
  .get('/getLinkList', getLinkList)// 获取友情链接列表
  .post('/addLink', addLink)
  .post('/updateLink', updateLink)
  .post('/delLink', deleteLink)
  .post('/getLinkDetail', getLinkDetail)
module.exports = router;
