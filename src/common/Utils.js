
const Cookies = require('js-cookie')
module.exports = {
  multiplePage: function({ pageNum = 0, pageSize = 10 }) {
    return pageNum - 1 < 0 ? 0 : (pageNum - 1) * pageSize
  },
  queryList: function(result) {
    if (result) {
      return {
        status: 200,
        data: {
          list: result,
          count: result.length
        },
        code: 0,
        message: 'success'
      }
    }
    return {
      status: 200,
      data: {
        list: [],
        count: 0
      },
      code: 1,
      message: 'failed'
    }
  },
  getCookie: function() {
    return Cookies.withConverter({
      read: function(value, name) {
        if (name === 'escaped') {
          return unescape(value)
        }
        // Fall back to default for all other cookies
        return Cookies.converter.read(value, name)
      }
    })
  }
}
