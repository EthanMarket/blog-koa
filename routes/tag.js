
const router = require('koa-router')();
router.prefix('');
const {
  getTagList,
  addTag,
  deleteTag
} = require('../src/controllers/Tag')
router
  .get('/getTagList', getTagList)// 获取tag列表
  .post('/addTag', addTag)
  .post('/delTag', deleteTag)
module.exports = router;
