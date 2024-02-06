const auth = require('../service/auth');

function checkAuth(req, res, next) {
    const token = req.cookies?.token;

    const user = auth.getUser(token);

    req.user = user;
    next();
}


function restrictToPost(req,res,next){
    const token = req.cookies?.token
    if (!token) return res.redirect("/login")

    const user = auth.getUser(token);
    if (!user) return res.redirect("/login")

    req.user = user;
    next();

}

module.exports = {
    checkAuth, restrictToPost
};
