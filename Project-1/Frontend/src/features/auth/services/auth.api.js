import axios from "axios"

const api = axios.create({
    baseURL : "http://localhost:3000/api/auth",
    withCredentials : true
})

export async function register(userName, email, password) {
    const response = await api.post("/register", {
        userName,
        email,
        password
    })
    return response.data
}

export async function login(identifier, password) {
    const payload = identifier.includes("@")
        ? { email: identifier, password }
        : { userName: identifier, password }

    const response = await api.post("/login", {
        ...payload
    })
    return response.data
}

export async function getData() {
    const response = await api.post("/get-me")
    return response.data
}

export async function logout() {
    const response = await api.post("/logout")
    return response.data
}
