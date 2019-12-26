const Comment = require('../models/Comment');
const Article = require('../models/Article');
const Joi = require('joi')
class CommentController {
  async getCommentList(ctx) {
    const { keyword, is_handle, pageNum, pageSize } = ctx.query
    const reg = new RegExp(keyword, 'i')
    const query = {
      $and: [
        { content: { $regex: reg } },
        { is_handle }
      ]
    }
    const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
    // 待返回的字段
    const fields = {
      article_id: 1,
      content: 1,
      is_top: 1,
      likes: 1,
      user_id: 1,
      user: 1,
      other_comments: 1,
      state: 1,
      is_handle: 1,
      create_time: 1
    };
    const options = {
      skip: skip,
      limit: Number(pageSize),
      sort: { create_time: -1 }
    };
    const result = await Comment.find(query, fields, options)
    if (result) {
      ctx.body = {
        status: 200,
        data: {
          list: result,
          count: result.length
        },
        code: 0,
        message: 'success'
      }
    }
  }

  async addComment(ctx) {
    const userInfo = ctx.session.userInfo
    if (userInfo) {
      const validator = ctx.validate(ctx.request.body, {
        _id: Joi.string().required(), // article_id
        user_id: Joi.string().required(),
        content: Joi.string().required()
      })
      if (validator) {
        const { _id, user_id, content } = ctx.request.body
        const comment = new Comment({
          article_id: _id,
          content: content,
          user_id: user_id,
          user: userInfo
        });
        const newComment = await comment.save()
        const article = await Article.findById(_id)
        const { comments, meta } = article
        comments.unshift(newComment._id)// 把评论id和文章关联
        ++meta.comments;
        const update = await Article.findOneAndUpdate(
          { _id },
          { comments, meta },
          { new: true }// 返回更新后的数据
        )
        const result = await Article.findById(_id).populate([
          { path: 'tags' },
          { path: 'comments' },
          { path: 'category' }
        ])
        if (result) {
          ctx.body = {
            status: 200,
            data: result,
            message: '操作成功',
            code: 0
          }
        }
      }
    }
  }

  async addSecondComment(ctx) {
    const userInfo = ctx.session.userInfo
    if (userInfo) {
      const validator = ctx.validate(ctx.request.body, {
        _id: Joi.string().required(), // article_id
        comment_id: Joi.string().required(),
        user_id: Joi.string().required(),
        content: Joi.string().required()
      })
      if (validator) {
        const { _id, comment_id, user_id, to_user, content } = ctx.request.body
        const firstComment = await Comment.findById(comment_id)
        const { other_comments } = firstComment
        const item = {
          user: userInfo,
          content: content,
          to_user
        };
        other_comments.push(item)
        const newComment = await Comment.findOneAndUpdate(
          { _id: comment_id },
          {
            other_comments,
            is_handle: 2
          })
        /* -----一级评论关联结束---------- */
        const article = await Article.findById(_id)
        const { meta } = article
        ++meta.comments
        const updateArticle = await Article.findOneAndUpdate(
          { _id },
          { meta },
          { new: true }// 返回更新后的数据
        )
        const result = await Article.findById(_id).populate([
          { path: 'tags' },
          { path: 'comments' },
          { path: 'category' }
        ])
        if (result) {
          ctx.body = {
            status: 200,
            data: result,
            message: '操作成功',
            code: 0
          }
        }
      }
    }
  }

  async changeComment(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required(),
      state: Joi.string().required()
    })
    if (validator) {
      const { _id, state, article_id } = ctx.request.body
      const updateComment = await Comment.updateOne({ _id }, { state: Number(state), is_handle: 1 })
      const result = await Article.findById(article_id).populate([
        { path: 'tags' },
        { path: 'comments' },
        { path: 'category' }
      ])
      if (result) {
        ctx.body = {
          status: 200,
          data: result,
          message: '更新成功',
          code: 0
        }
      }
    }
  }

  async changeSecondComment(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required(),
      state: Joi.string().required(),
      index: Joi.string().required()
    })
    if (validator) {
      const { article_id, _id, state, index } = ctx.request.body
      const firstComment = await Comment.findById({ _id })
      const { other_comments } = firstComment
      other_comments[Number(index)].state = Number(state);
      const updateComment = await Comment.updateOne(
        { _id },
        {
          other_comments,
          is_handle: 1
        })
      const result = await Article.findById(article_id).populate([
        { path: 'tags' },
        { path: 'comments' },
        { path: 'category' }
      ])
      const userInfo = ctx.session.userInfo
      if (userInfo) {
        const { _id } = userInfo
        const { like_users = [] } = result
        result.meta.currentUserLike = like_users.some(item => {
          return item._id == _id
        })
        like_users.length = 0
      }
      if (result) {
        ctx.body = {
          status: 200,
          data: result,
          message: '更新成功',
          code: 0
        }
      }
    }
  }
}

module.exports = new CommentController()
