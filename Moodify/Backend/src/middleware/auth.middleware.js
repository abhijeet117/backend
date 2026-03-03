const jwt = require("jsonwebtoken");
/* const blacklistModel = require("../models/blacklist.model") */
const { getJwtSecret } = require("../utils/auth.utils");
const redis = require("../config/cache");

function extractToken(req) {
  const authHeader = req.headers?.authorization;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return req.cookies?.token || null;
}

async function authUser(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      message: "Token not provided.",
    });
  }

  const secret = getJwtSecret();
  if (!secret) {
    return res.status(500).json({
      message: "Server configuration error: JWT secret is missing.",
    });
  }

  try {
    const isTokenBlacklisted = await redis.get(token)
    
    if (isTokenBlacklisted) {
      return res.status(401).json({
        message: "Invalid token.",
      });
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    req.authToken = token;
    return next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid token.",
    });
  }
}

module.exports = authUser;
