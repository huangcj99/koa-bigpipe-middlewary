const log4js = require('koa-log4');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');

/**
 * 获取配置logger
 * @return   {[type]}                [description]
 * @datetime 2016-12-08T21:34:04+080
 * @author joe<smallcatcat.joe@gmail.com>
 */
function getLogger() {
  // 生产环境输出到文件, 开发测试输出到 console
  const type = process.env.NODE_ENV === 'production' ? 'access' : 'console';

  //配置 log4js
  log4js.configure({
    appenders: [{
      type: 'console',
      category: 'console'
    }, {
      type: 'dateFile',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      category: 'access',
    }],
    levels: {
      access: 'DEBUG'
    }
  });

  return log4js.getLogger(type);
}

module.exports = getLogger();
module.exports.log4js = log4js;
