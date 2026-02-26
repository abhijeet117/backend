import axios from "axios"
import API_BASE_URL from "../../../config/apiBaseUrl"

const api = axios.create({
    baseURL : `${API_BASE_URL}/api/auth`,
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
