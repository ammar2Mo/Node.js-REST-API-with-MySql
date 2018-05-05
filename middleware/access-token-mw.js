var jwt = require('jsonwebtoken');
var config = require('clickberry-config');

exports.create = function (req, res, next) {
    var user = req.user;
    var accessPayload = createAccessPayload(user);

    res.locals.accessToken = createAccessToken(accessPayload);
    next();
};

exports.verify = function (tokenName) {
    return function (req, res, next) {
        jwt.verify(req.body[tokenName], config.get('token:accessSecret'), function (err, payloud) {
            if (err)
                return next(err);

            req.tokens = req.tokens || {};
            req.tokens[tokenName] = payloud;

            next();
        });
    };
};

function createAccessPayload(user) {
    return {
        userId: user._id,
        role: user.role
    };
}

function createAccessToken(payload) {
    var accessSecret = config.get("token:accessSecret");
    var accessTimeout = config.getInt("token:accessTimeout");
    return jwt.sign(payload, accessSecret, {expiresIn: accessTimeout});
}
