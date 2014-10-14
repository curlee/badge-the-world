var clientSessions = require('client-sessions');
var config = require('../lib/config');
var formatUrl = require('url').format;
var parseUrl = require('url').parse;
var path = require('path');

exports.csrf = require('./csrf');

var COOKIE_KEY = config('COOKIE_KEY', 'session');
var COOKIE_SECRET = config('COOKIE_SECRET');

exports.session = function session () {
  return clientSessions({
    cookieName: COOKIE_KEY,
    secret: COOKIE_SECRET,
    maxAge: (7 * 24 * 60 * 60 * 1000), //one week
    cookie: {
      httpOnly: true
    }
  });
};

exports.redirect = function (target, params, status) {
  if (typeof params === 'number') {
    status = params;
    params = {};
  }

  return function (req, res, next) {
    try {
      var url = res.locals.url(target, params);
    } catch (e) {
      var url = target;
    }

    if (params._qsa && req.query) {
      url = parseUrl(url, true);
      if (!url.query) url.query = {};

      Object.keys(req.query).forEach(function(key) {
        if (!url.query.hasOwnProperty(key))
          url.query[key] = req.query[key];
      });

      url = formatUrl(url);
    }

    return res.redirect(status || 302, url);
  }
};
