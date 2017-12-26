## koa使用的bigpipe首屏流式渲染中间件

适用于类似facsbook于新浪这种首屏需要获取多个数据源展示数据的业务，服务器获取到数据拼装完成后，则马上传到html中进行渲染，期间仅使用一条tcp链接

#### node环境（7.6.x以上）因为采用了async function

### 添加中间件

```
const { resolve } = require('path');

//在ctx上挂载createBigpipe方法
app.use(createBigpipeMiddlewary(
  templatePath = resolve(__dirname, './template'),  //template root
  publicPath = resolve(__dirname, './view')   //html root
));
```

### 使用

node
```
app.use((ctx) => {
  //将创建的bigpipe流赋值给body
  let bigpipe = ctx.body = ctx.createBigpipe();

  //先定义主html骨架
  bigpipe.defineLayout('/bigpipe.html');

  //注册模板字符串，可传入单个对象也可传入数组，获取的数据先到先输出到html上
  bigpipe.definePagelets([
    {
      id: 'A',  // html页面上对应的元素位置，如：<div id="A"></div>
      tpl: '/article.handlebars',  // 模板位置，采用handlebars模板引擎
      proxy: 'get+http://dev.api.cer.dingdingyisheng.mobi/api/base/article/593e4b40c0c77d0361b500e5'
    },
    {
      id: 'C',
      tpl: '/article.handlebars',
      proxy: 'get+http://dev.api.cer.dingdingyisheng.mobi/api/base/article/593e4b28c0c77d0361b500e4'
    },
    {
      id: 'B',
      tpl: '/article.handlebars',
      proxy: 'get+http://dev.api.cer.dingdingyisheng.mobi/api/base/article/593e4b28c0c77d0361b500e4'
    }
  ]);

  //开始渲染pageLets
  bigpipe.render();
})
```

html
```
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>test bigpipe</title>
<body>
  <div id="A"></div>

  <div id="B"></div>

  <div id="C"></div>
```

A, B, C的输出，不分前后，服务端拼装好html模板后就会输出到html上，而不需要在前端发送多个请求去获取数据
