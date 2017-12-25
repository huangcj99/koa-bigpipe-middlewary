# koa2使用的bigpipe中间件

### 添加中间件

```shell
const { resolve } = require('path');

// 在ctx上挂载createBigpipe方法
app.use(createBigpipeMiddlewary(
  templatePath = resolve(__dirname, './template'),  //template root
  publicPath = resolve(__dirname, './view')   //html root
));
```

### 使用

```shell
app.use((ctx) => {
  // 将创建的bigpipe流赋值给body
  let bigpipe = ctx.body = ctx.createBigpipe();

  // 先发送主html骨架
  bigpipe.defineLayout('/bigpipe.html');

  // 注册模板，可传入单个对象也可传入数组，获取的数据先到先输出到html上
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

  // 开始渲染pageLets
  bigpipe.render();
})
```
