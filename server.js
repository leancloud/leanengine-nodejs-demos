const url = require('url');
const Canvas = require('canvas');

require('http').createServer(function(req, res) {
  const urlInfo = url.parse(req.url, true)

  if (urlInfo.pathname !== '/') {
    res.statusCode = 404;
    return res.end();
  }

  const canvas = new Canvas(200, 200);
  const ctx = canvas.getContext('2d');

  ctx.font = '30px Impact';
  ctx.rotate(.1);
  ctx.fillText('Awesome!', 50, 100);

  var te = ctx.measureText('Awesome!');
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.lineTo(50, 102);
  ctx.lineTo(50 + te.width, 102);
  ctx.stroke();

  res.setHeader('Content-Type', 'text/html');
  res.end('<img src="' + canvas.toDataURL() + '" />');
}).listen(3000);
