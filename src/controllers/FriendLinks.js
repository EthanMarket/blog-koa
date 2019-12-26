const FriendLinks = require('../models/FriendLinks');
const Joi = require('joi')
const { multiplePage, queryList } = require('../common/Utils')
class FriendLinksController {
  async getLinkList(ctx) {
    const { keyword, pageNum, pageSize, type = '' } = ctx.query
    const reg = new RegExp(keyword, 'i');
    let query = {};
    if (keyword) {
      const reg = new RegExp(keyword, 'i');
      query = {
        $or: [{ name: { $regex: reg } }, { email: { $regex: reg } }]
      };
    }
    if (type !== '') {
      const { ...rest } = query
      query = {
        ...rest,
        type
      }
    }
    const fields = {
      _id: 1,
      start_time: 1,
      name: 1,
      desc: 1,
      icon: 1,
      url: 1,
      type: 1,
      state: 1
    }; // 待返回的字段
    const options = {
      skip: multiplePage({ pageNum, pageSize }),
      limit: Number(pageSize),
      sort: { end_time: -1 }
    };

    const list = await FriendLinks.find(query, fields, options)
    const total = await FriendLinks.count(query)
    if (list) {
      ctx.body = {
        status: 200,
        data: {
          list,
          total
        },
        code: 0,
        message: 'success'
      }
    }
  }

  async addLink(ctx) {
    const volitator = ctx.validate(ctx.request.body, {
      name: Joi.string(),
      url: Joi.string()
    })
    if (volitator) {
      const { name, desc, icon, url, type, state } = ctx.request.body
      const result = await FriendLinks.findOne({ name })
      if (result) {
        ctx.body = {
          status: 200,
          message: '该链接名已存在',
          code: 1
        }
      } else {
        const newLinks = new FriendLinks({
          name, desc, icon, url, type, state
        })
        const data = await newLinks.save()
        ctx.body = {
          status: 200,
          message: '添加成功',
          data: data,
          code: 0
        }
      }
    }
  }

  async deleteLink(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    const { _id } = ctx.request.body
    if (validator) {
      const result = await FriendLinks.remove({ _id })
      if (result.deletedCount) {
        ctx.body = {
          status: 200,
          message: '删除成功',
          data: { _id },
          code: 0
        }
      } else {
        ctx.body = {
          status: 200,
          message: '友情链接不存在',
          data: { _id },
          code: 1
        }
      }
    }
  }

  async updateLink(ctx) {
    const volitator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required(),
      name: Joi.string(),
      url: Joi.string()
    })
    if (volitator) {
      const { _id, name, desc, icon, url, type, state } = ctx.request.body
      const result = await FriendLinks.findOneAndUpdate({ _id }, { name, desc, icon, url, type, state }, { new: true })
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

  async getLinkDetail(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    if (validator) {
      const { _id } = ctx.request.body
      const result = await FriendLinks.findOne({ _id })
      ctx.body = {
        status: 200,
        data: result,
        message: '操作成功',
        code: 0
      }
    }
  }
}
module.exports = new FriendLinksController()
