const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
        next();
    } else {
        res.redirect("/login");
    }
};

const requireRole = (roleName) => {
    return (req, res, next) => {
        if (
            req.session &&
            req.session.user &&
            req.session.user.role_name === roleName
        ) {
            next();
        } else {
            req.flash(
                "error",
                "You do not have permission to access that resource"
            );

            res.redirect("/dashboard");
        }
    };
};

export { requireLogin, requireRole };