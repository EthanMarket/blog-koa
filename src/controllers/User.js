const crypto = require('crypto');
const User = require('../models/User')
const { createToken } = require('../common/Token')
const Joi = require('joi')

// MD5_SUFFIX: 'www.firepage.xyz',
const userHelper = {
  MD5_SUFFIX: 'www.biaochenxuying.cn*&^%$#',
  md5(pwd) {
    return crypto.createHash('md5').update(pwd).digest('hex');
  }
}

class UserController {
  // 站内用户登录
  async login(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      email: Joi.string().required(),
      password: Joi.string().required()
    })
    if (validator) {
      const { email, password } = ctx.request.body
      const user = await User.findOne({
        email,
        password: userHelper.md5(password + userHelper.MD5_SUFFIX)
      })
      if (!user) {
        ctx.throw(404, '用户不存在')
      } else {
        // const { id, role } = user
        // const token = createToken({ username: user.username, userId: id, role }) // 生成 token
        ctx.session.userInfo = user
        ctx.body = {
          code: 0,
          data: user,
          message: '登录成功'
          // token
        }
      }
    }
  }

  // 站内用户登录
  async loginAdmin(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      email: Joi.string().required(),
      password: Joi.string().required()
    })
    const { email, password } = ctx.request.body
    if (validator) {
      const user = await User.findOne({
        email,
        password: userHelper.md5(password + userHelper.MD5_SUFFIX)
      })

      if (!user) {
        ctx.throw(404, '用户不存在')
      } else {
        if (user.type === 0) {
          const { id, role } = user
          const token = createToken({ username: user.username, userId: id, role }) // 生成 token
          ctx.session.userInfo = user

          ctx.body = {
            code: 0,
            data: user,
            message: '登录成功',
            token
          }
        } else {
          ctx.throw(403, '用户无权限！')
        }
      }
    }
  }

  // 后台管理中当前用户
  async currentUser(ctx) {
    const user = await ctx.session.userInfo;
    user.avatar = 'https://gitee.com/reflectyi/pic/raw/master/logo.jpg';
    user.notifyCount = 0;
    user.address = '上海市';
    user.country = 'China';
    user.group = 'Ethan';
    user.title = '移动端菜鸟';
    user.signature = '海纳百川，有容乃大';
    user.tags = [];
    user.geographic = {
      province: {
        label: '上海市',
        key: '330000'
      },
      city: {
        label: '浦东新区',
        key: '330100'
      }
    }
    ctx.body = {
      status: 200,
      data: user,
      code: 0
    }
  }

  // 新用户注册
  async register(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      name: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      type: Joi.number().required()
    })

    if (validator) {
      const { name, password, phone, email, introduce, type } = ctx.request.body
      const result = await User.findOne({ where: { email } })
      if (result) {
        ctx.throw(403, '邮箱已被注册')
      } else {
        const user = await User.findOne({ where: { name } })
        if (user) {
          ctx.client(403, '用户名已被占用')
        } else {
          const newUser = new User({
            email,
            name,
            password: userHelper.md5(password + userHelper.MD5_SUFFIX),
            phone,
            type,
            introduce
          });
          const data = await newUser.save()
          ctx.body = {
            status: 200,
            data: data,
            code: 0
          }
        }
      }
    }
  }

  // 获取用户列表
  async getUserList(ctx) {
    const validator = ctx.validate(ctx.query, {
      pageNum: Joi.number(),
      pageSize: Joi.number()
    })
    if (validator) {
      const { pageNum = 0, pageSize, keyword, type = '' } = ctx.query
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
      const item = {
        _id: 1,
        email: 1,
        name: 1,
        avatar: 1,
        phone: 1,
        introduce: 1,
        type: 1,
        create_time: 1
      }
      const options = {
        skip: pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize,
        limit: Number(pageSize),
        sort: { create_time: -1 }
      };
      console.log('query---->>', query);
      const list = await User.find(query, item, options)
      const total = await User.count(query)
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

  async deleteUser(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    const { _id } = ctx.request.body
    if (validator) {
      const result = await User.remove({ _id })
      if (result.deletedCount) {
        ctx.body = {
          status: 200,
          message: '用户删除成功',
          data: { _id },
          code: 0
        }
      } else {
        ctx.body = {
          status: 200,
          message: '用户不存在',
          code: 1
        }
      }
    }
  }

  async updateUser(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required(),
      name: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string()
        .email()
        .required(),
      type: Joi.number().required()
    })
    if (validator) {
      const { _id, name, password, phone, email, introduce, type } = ctx.request.body
      const result = await User.findOneAndUpdate(
        { _id },
        {
          name,
          password,
          phone,
          email,
          introduce,
          type
        }, { new: true })
      ctx.body = {
        status: 200,
        data: result,
        message: '更新成功',
        code: 0
      }
    }
  }

  async logout(ctx) {
    if (ctx.session.userInfo) {
      ctx.session.userInfo = null
      ctx.body = {
        status: 200,
        message: '用户退出登录成功',
        code: 0
      }
    } else {
      ctx.body = {
        status: 200,
        message: '您尚未登录',
        code: 1
      }
    }
  }

  async getUserDetail(ctx) {
    const validator = ctx.validate(ctx.request.body, {
      _id: Joi.string().required()
    })
    if (validator) {
      const { _id } = ctx.request.body
      const result = await User.findOne({ _id })
      ctx.body = {
        status: 200,
        data: result,
        message: '操作成功',
        code: 0
      }
    }
  }
}
module.exports = new UserController()
