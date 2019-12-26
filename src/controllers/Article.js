const Article = require('../models/Article');
const User = require('../models/User');
const Joi = require('joi')
// 根据相应的条件获取文章列表
function _getList(ctx, conditions = {}, itemFields = {}, options = {}) {
  return Article.find(conditions, itemFields, options, (error, result) => {
    if (error) {
      console.log(error);
    } else {
      return result
    }
  }).populate([
    { path: 'tags' },
    { path: 'comments' },
    { path: 'category' }
  ])
}
const articleHelper = {
  skip: function({ pageNum, pageSize }) {
    return pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize
  }
}
class ArticleController {
  // 创建文章
  async creatArticle(ctx) {
    const {
      author,
      title,
      keyword,
      content,
      desc,
      img_url,
      tags,
      category,
      state,
      type,
      origin
    } = ctx.request.body
    const result = await Article.findOne({ title })
    if (result) {
      ctx.body = {
        status: 200,
        message: '该文章标题已存在',
        code: 1
      }
    } else {
      const tempArticle = new Article({
        title,
        author,
        keyword,
        content,
        numbers: content ? content.length : 0,
        desc,
        img_url,
        tags,
        category,
        state,
        type,
        origin
      })
      const data = await tempArticle.save()
      ctx.body = {
        status: 200,
        data,
        code: 0,
        message: '保存成功'
      }
    }
  }

  // 查询文章首页，所有的数据源
  async getArticleList(ctx) {
    const {
      likes,
      state,
      keyword,
      category_id = 0,
      tag_id = 0,
      pageNum = 1,
      pageSize = 10
    } = ctx.query
    const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    let query = {}
    if (keyword) {
      const keywordReg = new RegExp(keyword, 'i') // 不区分大小写
      // 查询条件
      query = {
        state,
        $or: [
          { title: { $regex: keywordReg } },
          { desc: { $regex: keywordReg } },
          { keyword: { $regex: keywordReg } }
        ]
      };
    }
    // 限制条件
    const options = {
      skip: skip,
      limit: Number(pageSize),
      sort: { create_time: -1 }
    };
    // 待返回的字段
    const fields = {
      title: 1,
      desc: 1,
      img_url: 1,
      tags: 1,
      category: 1,
      meta: 1,
      create_time: 1
    };
    const total = await Article.count(query)
    let list = []
    if (tag_id || category_id) { // 如果是按标签查询
      const tags = tag_id ? { tags: { _id: tag_id } } : {}
      const category = category_id ? { category: { _id: category_id } } : {}
      list = await Article.find(query, fields, options)
        .and({ ...tags, ...category })
        .populate({ path: 'tags' })
    } else {
      list = await _getList(ctx, query, fields, options)
    }

    ctx.body = {
      status: 200,
      data: { list, total },
      code: 0,
      message: '操作成功！'
    }
  }

  // 获取文章目录
  async getArticleDirectory(ctx) {
    const {
      state,
      article
    } = ctx.query
    const query = {}
    const fields = {
      title: 1,
      create_time: 1
    };
    // 限制条件
    const options = {
      limit: Number(1000),
      sort: { create_time: -1 }
    };
    const list = await Article.aggregate([
      { $match: query },
      {
        $project: {
          ...fields,
          year: { $year: '$create_time' }
        }
      },
      {
        $group: {
          _id: { year: '$year' }, // 将_id设置为year数据
          yearList: {
            $push: {
              _id: '$_id',
              title: '$title',
              create_time: '$create_time'
            }
          }
        }
      },
      { $sort: { create_time: 1 } }
    ])
    ctx.body = {
      status: 200,
      data: { list },
      code: 0,
      message: '操作成功！'
    }
  }

  // 后台文章列表
  async getArticleListAdmin(ctx) {
    const validator = ctx.validate(ctx.query, {
      category: Joi.string(),
      pageNum: Joi.string(),
      pageSize: Joi.number()
    })

    if (validator) {
      const {
        likes,
        state,
        keyword,
        pageNum = 0,
        pageSize = 10
      } = ctx.query
      const keywordReg = new RegExp(keyword, 'i') // 不区分大小写
      // 查询条件
      let query = {
        $or: [
          { title: { $regex: keywordReg } },
          { desc: { $regex: keywordReg } },
          { keyword: { $regex: keywordReg } }
        ]
      };
      if (state !== '') { // 搜索发布状态
        const { ...rest } = query
        query = {
          ...rest,
          state
        }
      }
      // 限制条件
      const options = {
        skip: articleHelper.skip({ pageNum, pageSize }),
        limit: Number(pageSize),
        sort: { create_time: -1, likes: (likes ? 1 : null) }
      };
      // 待返回的字段
      const fields = {
        title: 1,
        author: 1,
        keyword: 1,
        desc: 1,
        img_url: 1,
        tags: 1,
        category: 1,
        state: 1,
        type: 1,
        origin: 1,
        comments: 1,
        like_User_id: 1,
        meta: 1,
        create_time: 1
      };
      const list = await _getList(ctx, query, fields, options)
      const total = await Article.count(query)
      ctx.body = {
        status: 200,
        data: { list, total },
        code: 0,
        message: '操作成功！'
      }
    }
  }

  // 文章详情
  async getArticleDetail(ctx) {
    const { _id, type = 1, filter = 2 } = ctx.request.body
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    if (validator) {
      // type文章类型 => 1: 普通文章，2: 简历，3: 管理员介绍
      // filter文章的评论过滤 => 1: 过滤，2: 不过滤
      const { _id, type = 1, filter = 2 } = ctx.request.body
      const result = await Article.findById(_id).populate([
        { path: 'tags' },
        { path: 'comments' },
        { path: 'category' }
      ])
      if (result) { // 能查询到结果
        const { meta } = result
        ++result.meta.views;
        const updateResult = await Article.update({ _id }, { meta })
        const userInfo = ctx.session.userInfo
        if (userInfo) {
          const { _id } = userInfo
          const { like_users = [] } = result
          result.meta.currentUserLike = like_users.some(item => {
            return item._id == _id
          })
          like_users.length = 0
        }
        ctx.body = {
          status: 200,
          message: '操作成功',
          data: result,
          code: 0
        }
      }
    }
  }

  // 删除文章
  async deleteArticle(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    if (validator) {
      const { _id } = ctx.request.body
      const result = await Article.remove({ _id })
      if (result.deletedCount) {
        ctx.body = {
          status: 200,
          message: '文章删除成功',
          data: { _id },
          code: 0
        }
      } else {
        ctx.body = {
          status: 200,
          data: { _id },
          message: '文章删除失败',
          code: 1
        }
      }
    }
  }

  async updateArticle(ctx) {
    const {
      title,
      author,
      keyword,
      content,
      desc,
      img_url,
      tags,
      category,
      state,
      type,
      origin,
      _id
    } = ctx.request.body

    const result = await Article.findOneAndUpdate(
      { _id },
      {
        title,
        author,
        keyword,
        content,
        desc,
        img_url,
        tags,
        category,
        state,
        type,
        origin
      },
      { new: true }// 返回更新后的数据
    )
    if (result) {
      ctx.body = {
        status: 200,
        data: result,
        message: '文章更新成功',
        code: 0
      }
    }
  }

  async likeArticle(ctx) {
    if (ctx.session.userInfo) {
      const validator = ctx.validate(ctx.request.body, {
        _id: Joi.string().required(),
        user_id: Joi.string().required()
      })
      if (validator) {
        const { _id, user_id } = ctx.request.body
        const article = await Article.findOne({ _id })// 先查找到这篇文章
        if (article) {
          const { meta, like_users = [] } = article
          ++article.meta.likes
          const { name, avatar, create_time, type, introduce } = ctx.session.userInfo// 查找到点赞的对象
          like_users.push({ _id: user_id, name, avatar, create_time, type, introduce })
          const result = await Article.findOneAndUpdate(
            { _id },
            { meta, like_users },
            { new: true }// 返回更新后的数据
          )

          const articleDetail = await Article.findById(_id).populate([
            { path: 'tags' },
            { path: 'comments' },
            { path: 'category' }
          ])
          articleDetail.meta.currentUserLike = true
          if (articleDetail) {
            ctx.body = {
              status: 200,
              data: articleDetail,
              message: '操作成功',
              code: 0
            }
          }
        }
      }
    } else {
      ctx.body = {
        status: 200,
        message: '您尚未登录或登录信息过期！',
        code: 1
      }
    }
  }
}

module.exports = new ArticleController()
