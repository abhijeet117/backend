const jwt = require("jsonwebtoken")

function isValidUser(req, res, next) {
    const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({
          message: "Unauthorised access!",
        });
      }
    
      let decoded ;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({
          message: "Invalid token!",
        });
      }
    
        req.user = decoded
        next()

}

module.exports = isValidUser;   