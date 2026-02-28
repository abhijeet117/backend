const jwt = require("jsonwebtoken")

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

function isValidUsername(username) {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
    return usernameRegex.test(username)
}

function getJwtSecret() {
    return process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET || null
}

function signToken(userId) {
    const secret = getJwtSecret()
    if (!secret) {
        return null
    }

    return jwt.sign({ id: userId }, secret, { expiresIn: "7d" })
}

module.exports = {
    isValidEmail,
    isValidUsername,
    getJwtSecret,
    signToken
}
