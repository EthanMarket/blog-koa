const TimeAxis = require('../models/TimeAxis');
const Joi = require('joi')
class TimeAxisController {
  async getTimeAxisList(ctx) {
    const { keyword, pageNum, pageSize, state } = ctx.query
    let query = {}
    // 查询条件
    if (keyword) {
      const reg = new RegExp(keyword, 'i');
      query = {
        $or: [
          { title: { $regex: reg } },
          { desc: { $regex: reg } },
          { keyword: { $regex: reg } }
        ]
      };
    }
    if (state !== '') { // 搜索发布状态
      const { ...rest } = query
      query = {
        ...rest,
        state
      }
    }
    const fields = {
      title: 1,
      content: 1,
      state: 1,
      start_time: 1,
      end_time: 1
      // update_time: 1,
    }; // 待返回的字段
    const options = {
      skip: pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize,
      limit: Number(pageSize),
      sort: { end_time: -1 }
    };
    const list = await TimeAxis.find(query, fields, options)
    const total = await TimeAxis.count(query)
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

  async addTimeAxis(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      title: Joi.string().required(),
      content: Joi.string().required(),
      start_time: Joi.string(),
      end_time: Joi.string()
    })
    if (validator) {
      const {
        title,
        state,
        content,
        start_time,
        end_time
      } = ctx.request.body
      const result = await TimeAxis.findOne({ title })
      if (result) {
        ctx.body = {
          status: 200,
          message: '该标签已存在',
          code: 1
        }
      } else {
        const data = await new TimeAxis({
          title,
          state,
          content,
          start_time,
          end_time
        }).save()
        ctx.body = {
          status: 200,
          message: '添加成功',
          data,
          code: 0
        }
      }
    }
  }

  async updateTimeAxis(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required(),
      title: Joi.string().required(),
      content: Joi.string().required(),
      start_time: Joi.string(),
      end_time: Joi.string()
    })
    if (validator) {
      const {
        _id,
        title,
        state,
        content,
        start_time,
        end_time
      } = ctx.request.body
      const result = await TimeAxis.findOneAndUpdate(
        { _id }, {
          title,
          state,
          content,
          start_time,
          end_time
        }, { new: true })
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

  async delTimeAxis(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    const { _id } = ctx.request.body
    if (validator) {
      const result = await TimeAxis.remove({ _id })
      if (result.deletedCount) {
        ctx.body = {
          status: 200,
          message: '时间轴删除成功',
          data: { _id },
          code: 0
        }
      } else {
        ctx.body = {
          status: 200,
          data: { _id },
          message: '时间轴内容不存在',
          code: 1
        }
      }
    }
  }

  async getTimeAxisDetail(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    if (validator) {
      const { _id } = ctx.request.body
      const result = await TimeAxis.findOne({ _id })
      ctx.body = {
        status: 200,
        data: result,
        message: '操作成功',
        code: 0
      }
    }
  }
}

module.exports = new TimeAxisController()
