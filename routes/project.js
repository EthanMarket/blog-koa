
const router = require('koa-router')();
router.prefix('');
const {
  getProjectList,
  addProject,
  updateProject,
  delProject,
  getProjectDetail
} = require('../src/controllers/Project')
router
  .get('/getProjectList', getProjectList)// 获取项目列表
  .post('/addProject', addProject)
  .post('/updateProject', updateProject)
  .post('/delProject', delProject)
  .post('/getProjectDetail', getProjectDetail)
module.exports = router;
