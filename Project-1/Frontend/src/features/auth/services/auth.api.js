import axios from "axios"

const api = axios.create({
    baseURL : "http://localhost:3000/api/auth",
    withCredentials : true
})

export async function register(username, email, password) {
    const response = await api.post("/register", {
        username,
        email,
        password
    })
    return response.data
}

export async function login(username, password) {
    const response = await api.post("/login", {
        username,
        password
    })
    return response.data
}

export async function getData(username, password, bio, profileImg) {
    const response = await api.post("/get-me", {
        username,
        password,
        bio,
        profileImg
    })
    return response.data
}
