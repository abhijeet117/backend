const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const {
    isValidEmail,
    isValidUsername,
    getJwtSecret,
    signToken
} = require("../utils/auth.utils")

const redis = require("../config/cache")

function getCookieOptions() {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000
    }
}

function getClearCookieOptions() {
    return {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    }
}

function parseBody(body) {
    if (!body) {
        return {}
    }

    if (typeof body === "string") {
        try {
            return JSON.parse(body)
        } catch (error) {
            return {}
        }
    }

    return typeof body === "object" ? body : {}
}

function extractAuthPayload(req) {
    const parsedBody = parseBody(req.body)
    if (parsedBody?.data && typeof parsedBody.data === "object") {
        return parsedBody.data
    }

    if (parsedBody?.payload && typeof parsedBody.payload === "object") {
        return parsedBody.payload
    }

    return parsedBody
}

function extractAuthToken(req) {
    const authHeader = req.headers?.authorization
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        return authHeader.slice(7).trim()
    }

    return req.authToken || req.cookies?.token || null
}

async function registerUser(req, res) {
    try {
        const payload = extractAuthPayload(req)
        const fullName = typeof payload?.fullName === "string" ? payload.fullName.trim() : ""
        const username = typeof payload?.username === "string" ? payload.username.trim() : ""
        const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : ""
        const password = typeof payload?.password === "string" ? payload.password.trim() : ""

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ message: "Full name, username, email, and password are required." })
        }

        if (!isValidUsername(username)) {
            return res.status(400).json({
                message: "Username must be 3-30 characters and contain only letters, numbers, or underscore."
            })
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ message: "Please provide a valid email address." })
        }

        if (password.length < 6 || password.length > 128) {
            return res.status(400).json({ message: "Password must be between 6 and 128 characters." })
        }

        if (!getJwtSecret()) {
            return res.status(500).json({ message: "Server configuration error: JWT secret is missing." })
        }

        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        })

        if (existingUser) {
            return res.status(409).json({ message: "User already exists with this email or username." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await userModel.create({
            fullName,
            username,
            email,
            password: hashedPassword
        })

        const token = signToken(newUser._id)

        if (!token) {
            return res.status(500).json({ message: "Server configuration error: JWT secret is missing." })
        }

        res.cookie("token", token, getCookieOptions())

        return res.status(201).json({
            message: "User registered successfully.",
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email
            }
        })
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: "User already exists with this email or username." })
        }

        return res.status(500).json({ message: "Failed to register user.", error: error.message })
    }
}

async function loginUser(req, res) {
    try {
        const payload = extractAuthPayload(req)
        const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : ""
        const username = typeof payload?.username === "string" ? payload.username.trim() : ""
        const password = typeof payload?.password === "string" ? payload.password.trim() : ""

        if (!password) {
            return res.status(400).json({ message: "Password is required." })
        }

        if (!email && !username) {
            return res.status(400).json({ message: "Email or username is required." })
        }

        if (!getJwtSecret()) {
            return res.status(500).json({ message: "Server configuration error: JWT secret is missing." })
        }

        const query = email ? { email } : { username }
        const user = await userModel.findOne(query).select("+password fullName username email")

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials." })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials." })
        }

        const token = signToken(user._id)

        if (!token) {
            return res.status(500).json({ message: "Server configuration error: JWT secret is missing." })
        }

        res.cookie("token", token, getCookieOptions())

        return res.status(200).json({
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Failed to login user.", error: error.message })
    }
}

async function getme(req, res) {
    try {
        const user = await userModel
            .findById(req.user.id)
            .select("fullName username email")
            .lean()

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        return res.status(200).json({
            message: "User fetched successfully.",
            user: {
                id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch user.", error: error.message })
    }
}

async function saveExpression(req, res) {
    try {
        const payload = extractAuthPayload(req)
        const mood = typeof payload?.mood === "string" ? payload.mood.trim() : ""
        const allowedMoods = new Set(["Happy", "Calm", "Energetic", "Melancholy"])

        if (!allowedMoods.has(mood)) {
            return res.status(400).json({
                message: "Invalid mood value."
            })
        }

        const expression = {
            mood,
            capturedAt: new Date()
        }

        const user = await userModel.findByIdAndUpdate(
            req.user.id,
            {
                $push: {
                    expressionHistory: {
                        $each: [expression],
                        $slice: -100
                    }
                }
            },
            {
                new: true
            }
        ).select("expressionHistory")

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        const latestExpression = user.expressionHistory[user.expressionHistory.length - 1]

        return res.status(200).json({
            message: "Expression saved successfully.",
            expression: latestExpression
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to save expression.",
            error: error.message
        })
    }
}

async function getExpressionHistory(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("expressionHistory")

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        const history = [...user.expressionHistory].sort((a, b) => {
            return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
        })

        return res.status(200).json({
            message: "Expression history fetched successfully.",
            history
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch expression history.",
            error: error.message
        })
    }
}

async function logout(req, res) {
  try {
    const token = extractAuthToken(req);
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (token) {
      const decoded = jwt.decode(token);
      const tokenTtl = typeof decoded?.exp === "number" ? decoded.exp - nowInSeconds : 0;

      if (tokenTtl > 0) {
        try {
          await redis.set(token, "blacklisted", "EX", tokenTtl);
        } catch (redisError) {
          console.log("Redis blacklist write failed:", redisError.message);
        }
      }
    }

    res.clearCookie("token", getClearCookieOptions());

    return res.status(200).json({
      message: "Logout successful.",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to logout user.",
      error: error.message,
    });
  }
}



module.exports = {registerUser, loginUser, getme, logout, saveExpression, getExpressionHistory}
