const Tag = require('../models/Tag');
const Joi = require('joi')
class TagController {
  async getTagList(ctx) {
    const validator = ctx.validate(ctx.query, {
      pageNum: Joi.number(),
      pageSize: Joi.number()
    })
    if (validator) {
      const { pageNum = 0, pageSize = 10, keyword } = ctx.query
      let query = {};
      if (keyword) {
        const reg = new RegExp(keyword, 'i');
        query = {
          $or: [{ name: { $regex: reg } }, { desc: { $regex: reg } }]
        };
      }
      const skip = pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize;
      console.log('skip---------->>', skip);
      const fields = {
        _id: 1,
        name: 1
      }
      const options = {
        skip: pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize,
        limit: Number(pageSize),
        sort: { create_time: -1 }
      };
      const result = await Tag.find(query, fields, options)
      const total = await Tag.count(query)
      ctx.body = {
        status: 200,
        data: {
          list: result,
          total
        },
        code: 0,
        message: 'success'
      }
    }
  }

  async addTag(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      name: Joi.string().required(),
      desc: Joi.string().required()
    })
    if (validator) {
      const { name, desc } = ctx.request.body
      const result = await Tag.findOne({ where: { name } })
      if (result) {
        ctx.body = {
          status: 200,
          message: '该标签已存在',
          code: 1
        }
      } else {
        const newTag = new Tag({
          name,
          desc
        })
        const data = await newTag.save()
        ctx.body = {
          status: 200,
          message: '添加成功',
          data: data,
          code: 0
        }
      }
    }
  }

  async deleteTag(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    const { _id } = ctx.request.body
    if (validator) {
      const result = await Tag.remove({ _id })
      if (result.deletedCount) {
        ctx.body = {
          status: 200,
          message: '标签删除成功',
          data: { _id },
          code: 0
        }
      } else {
        ctx.body = {
          status: 200,
          data: { _id },
          message: '标签不存在',
          code: 1
        }
      }
    }
  }
}

module.exports = new TagController()
