
const router = require('koa-router')();
router.prefix('');
const {
  getCommentList,
  addComment,
  addSecondComment,
  changeComment,
  changeSecondComment
} = require('../src/controllers/Comment')
router
  .get('/getCommentList', getCommentList)// 获取评论列表
  .post('/addComment', addComment)// 添加评论
  .post('/addSecondComment', addSecondComment)// 添加二级三级评论
  .post('/changeComment', changeComment)// 修改一级评论
  .post('/changeSecondComment', changeSecondComment)// 修改二级三级评论
module.exports = router;
