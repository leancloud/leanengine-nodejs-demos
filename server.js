var fs = require('fs');
var url = require('url');
var phantomjs = require('phantomjs-prebuilt');

require('http').createServer(function(req, res) {
  const urlInfo = url.parse(req.url, true)

  if (urlInfo.pathname !== '/') {
    res.statusCode = 404;
    return res.end();
  }

  if (urlInfo.query.url) {
    makeScreenshot(urlInfo.query.url, (err, filename) => {
      if (err) {
        return res.end(err);
      }

      fs.readFile(filename, function(err, buffer) {
        if (err) {
          res.end(err.message);
        } else {
          res.setHeader('Content-Type', 'image/png');
          res.end(buffer);
        }
      })
    });
  } else {
    res.end('You can visit https://snapcat.leanapp.cn/?url=https://leancloud.cn/docs');
  }
}).listen(3000);

var counter = 0;

function makeScreenshot(url, callback) {
  const filename = `./${counter++}.png`;
  const program = phantomjs.exec('phantomjs-web.js', url, filename);

  program.stdout.pipe(process.stdout);

  var stderr = '';

  program.stderr.on('data', data => {
    stderr += data.toString();
  });

  program.on('exit', () => {
    callback(stderr === '' ? null : stderr, filename);
  });
}
