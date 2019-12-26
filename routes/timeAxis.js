
const router = require('koa-router')();
router.prefix('');
const {
  getTimeAxisList,
  getTimeAxisDetail,
  addTimeAxis,
  updateTimeAxis,
  delTimeAxis
} = require('../src/controllers/TimeAxis')
router
  .get('/getTimeAxisList', getTimeAxisList)// 获取TimeAxis列表
  .post('/getTimeAxisDetail', getTimeAxisDetail)
  .post('/addTimeAxis', addTimeAxis)
  .post('/updateTimeAxis', updateTimeAxis)
  .post('/delTimeAxis', delTimeAxis)
module.exports = router;
