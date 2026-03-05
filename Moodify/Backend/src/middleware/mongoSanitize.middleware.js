function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]"
}

function sanitizeMongoOperators(target) {
    if (Array.isArray(target)) {
        target.forEach((item) => sanitizeMongoOperators(item))
        return target
    }

    if (!isPlainObject(target)) {
        return target
    }

    Object.keys(target).forEach((key) => {
        const value = target[key]

        if (key.startsWith("$") || key.includes(".")) {
            delete target[key]
            return
        }

        sanitizeMongoOperators(value)
    })

    return target
}

function mongoSanitizeMiddleware(req, res, next) {
    sanitizeMongoOperators(req.body)
    sanitizeMongoOperators(req.params)
    sanitizeMongoOperators(req.query)
    next()
}

module.exports = mongoSanitizeMiddleware
