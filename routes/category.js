
const router = require('koa-router')();
router.prefix('');
const {
  getCategoryList,
  addCategory,
  deleteCategory
} = require('../src/controllers/Category')
router
  .post('/addCategory', addCategory)
  .post('/delCategory', deleteCategory)
  .get('/getCategoryList', getCategoryList);
module.exports = router;
