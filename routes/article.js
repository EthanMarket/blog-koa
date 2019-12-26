const router = require('koa-router')();
router.prefix('');

const {
  getArticleList,
  getArticleDirectory,
  creatArticle,
  getArticleListAdmin,
  getArticleDetail,
  deleteArticle,
  updateArticle,
  likeArticle
} = require('../src/controllers/Article')

router
  .post('/addArticle', creatArticle) // 创建文章
  .get('/getArticleList', getArticleList) // 获取文章列表
  .get('/getArticleDirectory', getArticleDirectory) // 获取文章目录
  .get('/getArticleListAdmin', getArticleListAdmin) // 获取后台文章列表
  .post('/getArticleDetail', getArticleDetail)// 获取文章详情
  .post('/delArticle', deleteArticle)// 删除文章
  .post('/updateArticle', updateArticle)// 更新文章
  .post('/likeArticle', likeArticle)
module.exports = router
