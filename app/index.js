const config = require('./lib/config');
const express = require('express');
const flash = require('connect-flash');
const helpers = require('./helpers');
const middleware = require('./middleware');
const nunjucks = require('nunjucks');
const path = require('path');
const views = require('./views');
const spreadsheet = require('edit-google-spreadsheet');

const app = express();
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(path.join(__dirname, 'templates')), {autoescape: true});
env.express(app);

// Bootstrap the app for reversible routing, and other niceties
require('../lib/router.js')(app);

var staticDir = path.join(__dirname, '/static');
var staticRoot = '/static';

app.use(function (req, res, next) {
  res.locals.static = function static (staticPath) {
    return path.join(app.mountPoint, staticRoot, staticPath).replace(/\\/g,'/');
  }
  next();
});

app.use(express.compress());
app.use(express.bodyParser());
app.use(middleware.session());
app.use(middleware.csrf());
app.use(flash());

app.use(helpers.addCsrfToken);
app.use(helpers.addMessages);

app.use(staticRoot, express.static(staticDir));

app.get('/', 'home', views.home);
app.get('/pledge', 'pledge', views.pledge);
app.get('/contact', 'contact', views.contact);
app.get('/info', 'info', views.info);
app.get('/pledges', function(req, res) {
  spreadsheet.load(
    {
      debug: true,
      spreadsheetId: config('SHEETID'),
      worksheetId: config('WORKSHEETID'),
      oauth: {
        email: config('GEMAIL'),
        key: config('GKEY'),
        passphrase: 'notasecret'
      }
    },
    function ready( err, sheet ) {
      if (err) {
        console.log(err);
      }

      sheet.receive( function(err, rows, info) {
        if (err) {
          console.log(err);
        }

        var data = []
        var row = null;
        
        for (row in rows) {
          if ( row != "1" ) {
            d = {
              "timestamp":rows[row]["1"],
              "fiveways":rows[row]["2"],
              "ideas":rows[row]["3"],
              "numPeople":rows[row]["4"],
              "location":rows[row]["5"]
            }
            data.push( d );
          }
        }

        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify(data));

      });

    }
  );
});

if (!module.parent) {
  var port = config('PORT', 3000);

  app.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on port " + port + ".");
  });
} else {
  module.exports = http.createServer(app);
}