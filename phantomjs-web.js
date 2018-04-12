var page = require('webpage').create();
var system = require('system');

page.viewportSize = { width: 1440, height: 900 };

page.open(system.args[1], function (status) {
  page.render(system.args[2], {format: 'png'});
  phantom.exit();
});
