var jwt = require('jsonwebtoken');
var shortid = require('shortid');
var error = require('clickberry-http-errors');
var config = require('clickberry-config');
var Signature = require('../lib/signature');
var signature = new Signature(config.get("token:exchangeSecret"));

function create(req, res, next) {
    var token = shortid.generate();
    var exchangePayload = createExchangePayload(req.user, token);

    res.locals.exchangeToken = createJwtToken(exchangePayload);
    res.cookie('exchangeTokenCookie', signature.sign(token), {httpOnly: true});

    next();
}

function check(req, res, next) {
    if (!req.cookies) {
        return next(new error.Forbidden());
    }

    var result = signature.verify(req.token, req.cookies.exchangeTokenCookie);
    if (!result) {
        return next(new error.Forbidden());
    }

    next();
}

function clear(req, res, next) {
    res.clearCookie('exchangeTokenCookie');

    next();
}

exports.create = create;
exports.check = check;
exports.clear = clear;

function createExchangePayload(user, token) {
    return {
        userId: user._id,
        token: token
    };
}

function createJwtToken(payload) {
    var exchangeSecret = config.get("token:exchangeSecret");
    var exchangeTimeout = config.getInt("token:exchangeTimeout");
    return jwt.sign(payload, exchangeSecret, {expiresIn: exchangeTimeout});
}
