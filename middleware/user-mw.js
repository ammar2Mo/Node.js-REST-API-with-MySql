exports.update = function (req, res, next) {
    req.user.save(function (err) {
        if (err)
            return next(err);

        next();
    });
};