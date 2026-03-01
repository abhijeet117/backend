const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const {
    isValidEmail,
    isValidUsername,
    getJwtSecret,
    signToken
} = require("../utils/auth.utils")

const blacklistModel = require("../models/blacklist.model")

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

async function registerUser(req, res) {
    try {
        const payload = extractAuthPayload(req)
        const username = typeof payload?.username === "string" ? payload.username.trim() : ""
        const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : ""
        const password = typeof payload?.password === "string" ? payload.password.trim() : ""

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required." })
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
        const user = await userModel.findOne(query).select("+password username email")

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
        const user = await userModel.findById(req.user.id).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            })
        }

        return res.status(200).json({
            message: "User fetched successfully.",
            user
        })
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch user.", error: error.message })
    }
}

async function logout(req, res) {
    try {
        const token = req.authToken || req.cookies?.token

        if (token) {
            await blacklistModel.create({ token })
        }

        res.clearCookie("token", getClearCookieOptions())

        return res.status(200).json({
            message: "Logout successful."
        })
    } catch (error) {
        return res.status(500).json({ message: "Failed to logout user.", error: error.message })
    }
}



module.exports = {registerUser, loginUser, getme,logout}
