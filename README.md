## koa2
* 感谢[@夜尽天明](https://github.com/biaochenxuying)提供的项目，我只是koa2做了重构
* 配合[`react-blog`](https://github.com/EthanMarket/blog-react)和[`react-blog-admin`](https://github.com/EthanMarket/blog-react-admin)后台管理系统使用
* 本项目使用koa2+MongoDB开发

### 用户首次登陆注册
* 使用[**postman**](https://www.getpostman.com/)注册

![](https://gitee.com/reflectyi/pic/raw/master/web/reactblog/user-register.png)

### 一、blog-koa 目录结构
* `routes` 接口api
	* [`article.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/article.js) //文章相关信息
	* [`category.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/category.js) //文章分类相关
	* [`comment.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/comment.js) //评论相关
	* [`friendLinks.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/friendLinks.js) //友情链接
	* [`project.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/project.js)//项目相关
	* [`tag.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/tag.js)//标签
	* [`timeAxis.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/timeAxis.js)//时间归档，目前没有使用，使用的是article的目录
	* [`user.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/user.js) //用户相关
	* [`index.js`](https://github.com/EthanMarket/blog-koa/blob/master/routes/index.js)//通过遍历读取`routes`目录下的js文件，加入到routes当中
* `src` 
	* `common` //存放公共内容目录
 		* [`Token.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/common/Token.js) //计划存放token生成和解析，但是目前没有使用`token`
 	* `config`//配置文件目录
 		* [`config.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/config/config.js) //配置`session，mongodb，TOKEN`
 		* [`context.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/config/context.js)//配置全局上下文，这里主要处理`Joi`验证请求参数
 		* [`mongodb.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/config/mongodb.js)//配置`mongodb`连接
 	* `controllers` //收到`routes`转发的请求后，操作`model`
 		* [`Article.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/controllers/Article.js)
 		* [`Category.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/controllers/Category.js)
 		* [`Comment.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/controllers/Comment.js)
 		* [`FriendLinks.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/controllers/FriendLinks.js)
 		* [`Project.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/controllers/Project.js)
 		* [`Tag.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/controllers/Tag.js)
 		* [`TimeAxis.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/controllers/TimeAxis.js)
 		* [`User.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/controllers/User.js)
 	* `models` //操作数据库，数据模型
 		* [`Article.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/models/Article.js)
 		* [`Category.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/models/Category.js)
 		* [`Comment.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/models/Comment.js)
 		* [`FriendLinks.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/models/FriendLinks.js)
 		* [`Project.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/models/Project.js)
 		* [`Tag.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/models/Tag.js)
 		* [`TimeAxis.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/models/TimeAxis.js)
 		* [`User.js`](https://github.com/EthanMarket/blog-koa/blob/master/src/models/User.js)
* [`.eslintrc.json`](https://github.com/EthanMarket/blog-koa/blob/master/.eslintrc.json)//配置eslint
* [`app.js`](https://github.com/EthanMarket/blog-koa/blob/master/app.js)//配置整个工程相关内容
* [`package.json`](https://github.com/EthanMarket/blog-koa/blob/master/package.json)//项目依赖库

### 二、返回数据结构
#### 1、请求数据成功，返回数据结构
    
		{
              status: 200,
              data: {
				********
					},
              message: '操作成功',
              code: 0 //code===0，证明返回数据成功
            }
#### 2、请求返回失败

    {
        status: 200,
        message: '您尚未登录或登录信息过期！',
        code: 1 //code===1，证明请求有问题
      }

### 三、Node：
* Article详情页
	* `likeArticle` 点赞完成后，会返回整个文章详情
* `Comment` 评论接口，均返回更新后的整个文章详情