const Project = require('../models/Project');
const Joi = require('joi')
class ProjectController {
  async getProjectList(ctx) {
    const {
      keyword,
      state = '',
      pageNum = 1,
      pageSize = 10
    } = ctx.query
    let query = {}
    // 查询条件
    if (keyword) {
      const reg = new RegExp(keyword, 'i');
      query = {
        $or: [{ title: { $regex: reg } }, { content: { $regex: reg } }]
      };
    }
    if (state !== '') {
      const { ...rest } = query
      query = {
        ...rest,
        state
      }
    }
    const fields = {
      title: 1,
      content: 1,
      img: 1,
      url: 1,
      state: 1,
      start_time: 1,
      end_time: 1,
      update_time: 1
    }; // 待返回的字段
    const options = {
      skip: pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize,
      limit: Number(pageSize),
      sort: { end_time: -1 }
    };
    const list = await Project.find(query, fields, options)
    const total = await Project.count(query)
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

  async addProject(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      title: Joi.string().required(),
      content: Joi.string().required(),
      url: Joi.string().required(),
      state: Joi.string(),
      img: Joi.string(),
      start_time: Joi.string(),
      end_time: Joi.string()
    })
    if (validator) {
      const {
        title,
        state,
        content,
        url,
        img,
        start_time,
        end_time
      } = ctx.request.body
      const result = await Project.findOne({ title })
      if (result) {
        ctx.body = {
          status: 200,
          message: '该标签已存在',
          code: 1
        }
      } else {
        const data = await new Project({
          title,
          state,
          content,
          url,
          img,
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

  async updateProject(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required(),
      title: Joi.string().required(),
      content: Joi.string().required(),
      url: Joi.string().required(),
      state: Joi.number(),
      img: Joi.string(),
      start_time: Joi.string(),
      end_time: Joi.string()
    })
    if (validator) {
      const {
        _id,
        title,
        state,
        content,
        url,
        img,
        start_time,
        end_time
      } = ctx.request.body

      const result = await Project.findOneAndUpdate(
        { _id },
        {
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

  async delProject(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    const { _id } = ctx.request.body
    if (validator) {
      const result = await Project.remove({ _id })
      if (result.deletedCount) {
        ctx.body = {
          status: 200,
          message: '项目删除成功',
          data: { _id },
          code: 0
        }
      } else {
        ctx.body = {
          status: 200,
          data: { _id },
          message: '项目内容不存在',
          code: 1
        }
      }
    }
  }

  async getProjectDetail(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    if (validator) {
      const { _id } = ctx.request.body
      const result = await Project.findOne({ _id })
      ctx.body = {
        status: 200,
        data: result,
        message: '操作成功',
        code: 0
      }
    }
  }
}
module.exports = new ProjectController()
