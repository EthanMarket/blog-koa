const Category = require('../models/Category');
const Joi = require('joi')

class CategoryController {
  async getCategoryList(ctx) {
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
      const fields = {
        _id: 1,
        name: 1
      }
      const options = {
        skip: pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize,
        limit: Number(pageSize),
        sort: { create_time: -1 }
      };
      const result = await Category.find(query, fields, options)
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

  async addCategory(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      name: Joi.string(),
      desc: Joi.string()
    })
    if (validator) {
      const { name, desc } = ctx.request.body
      const result = await Category.findOne({ where: { name } })
      if (result) {
        ctx.body = {
          status: 200,
          message: '该标签已存在',
          code: 1
        }
      } else {
        const newCategory = new Category({
          name,
          desc
        })
        const data = await newCategory.save()
        ctx.body = {
          status: 200,
          message: '添加成功',
          data: data,
          code: 0
        }
      }
    }
  }

  async deleteCategory(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      id: Joi.string()
    })
    if (validator) {
      const { id } = ctx.request.body
      const result = await Category.remove({ _id: id })
      if (result.deletedCount) {
        ctx.body = {
          status: 200,
          message: '操作成功',
          code: 0
        }
      } else {
        ctx.body = {
          status: 200,
          message: '分类不存在',
          code: 1
        }
      }
    }
  }
}

module.exports = new CategoryController()
