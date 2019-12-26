// db/db.js
const CONFIG = require('./config');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
mongoose.connect(CONFIG.mongodb);

mongoose.connection.on('connected', () => {
  console.log('Mongoose connection open to ' + CONFIG.mongodb);
});
// 连接成功
mongoose.connection.once('open', () => {
  console.log('数据库连接成功!');
});

/**
* 连接异常 error 数据库连接错误
*/
mongoose.connection.on('error', err => {
  console.log('数据库连接失败: ' + err);
});
/**
* 连接断开 disconnected 连接异常断开
*/
mongoose.connection.on('disconnected', () => {
  console.log('数据库断开连接');
});
// 自增 ID 初始化
autoIncrement.initialize(mongoose.connection);
// mongoose
exports.mongoose = mongoose
