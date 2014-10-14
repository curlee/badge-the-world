
exports.home = function home (req, res, next) {
  return res.render('core/home.html');
}



exports.pledge = function home (req, res, next) {
  return res.render('core/pledge.html');
}

exports.contact = function contact (req, res, next) {
  return res.render('core/contact.html');
}

exports.info = function info (req, res, next) {
  return res.render('core/info.html');
}