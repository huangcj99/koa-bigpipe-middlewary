const fs = require('fs');
const { resolve, join } = require('path');
const Readable = require('stream').Readable;
const Handlebars = require('handlebars');

const proxy = require('./proxy');

module.exports = Bigpipe;

class Bigpipe extends Readable {
  constructor(props) {
    super(props);
    this.appContext = props.appContext;
    this.templatePath = props.templatePath;
    this.publicPath = props.publicPath;
    this.layout = '';
    this.pagelets = [];
    this.pageletsNum = 0;
  }

  _read() {}

  // 配置好后渲染主逻辑
  async render() {
    // 输出html骨架
    this.push(this.layout);

    // 先完成先输出
    await Promise.all(this.wrap(this.pagelets))

    // 结束传输
    this.done();
  }

  //将proxy，包装成Promise
  wrap(pagelets) {
    return pagelets.map((pagelet, idx) => {
      return new Promise((resolve, reject) => {
        // ctx.proxy为异步
        (async () => {
          let data = null,
              tpl = function() {},
              tplHtml = '';

          data = await proxy(pagelet.proxy.url);

          tpl = this.getHtmlTemplate(pagelet.tpl);
          tplHtml = this.clearEnter(tpl(data));

          this.push(`
            <script>
              var renderFlush = function(selector, html) {
                var dom = document.querySelector(selector);
                dom.innerHTML = html
              };
              renderFlush("#${pagelet.id}","${tplHtml}")
            </script>
          `)
          this.pageletsNum--;
          resolve()
        })()

      })
    })
  }

  // 获取骨架并转成字符串
  getHtmlTemplate(realPath) {
    let tplSource = fs.readFileSync(join(this.templatePath, realPath)).toString();

    return Handlebars.compile(tplSource);
  }

  // 用于清除模板字符串的换行
  clearEnter(html) {
    return html.replace(/[\r\n]/g,"")
  }

  // 设置html骨架
  defineLayout(realPath) {
    this.layout = fs.readFileSync(join(this.publicPath, realPath)).toString();
  }

  // 设置模板配置
  definePagelets(pagelets) {
    if (Array.isArray(pagelets)) {
      this.pagelets = this.pagelets.concat(pagelets);
    } else {
      if (typeof pagelets === 'object') {
        this.pagelets.push(pagelets)
      }
    }

    this.pageletsNum = this.pagelets.length;
  }

  // 关闭stream
  done() {
    if (this.pageletsNum === 0) {
      this.push('</body></html>');
      this.push(null)
    }
  }
}
