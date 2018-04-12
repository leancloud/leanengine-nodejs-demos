var fs = require('fs');
var url = require('url');
const puppeteer = require('puppeteer');

require('http').createServer(function(req, res) {
  const urlInfo = url.parse(req.url, true)

  if (urlInfo.pathname !== '/') {
    res.statusCode = 404;
    return res.end();
  }

  if (urlInfo.query.url) {
    makeScreenshot(urlInfo.query.url).then( (filename) => {
      fs.readFile(filename, function(err, buffer) {
        if (err) {
          res.end(err.message);
        } else {
          res.setHeader('Content-Type', 'image/png');
          res.end(buffer);
        }
      });
    }).catch( err => {
      console.log(err)
      res.end(err.message);
    });
  } else {
    res.end('You can visit https://snapcat.leanapp.cn/?url=https://leancloud.cn/docs');
  }
}).listen(3000);

var counter = 0;

async function makeScreenshot(url) {
  const filename = `./${counter++}.png`;

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(url);

  await page.setViewport({
    width: 1440,
    height: 900
  });

  await page.screenshot({
    fullPage: true,
    path: filename
  });

  await browser.close();

  return filename;
}
