import axios from 'axios'

const api = axios.create({
    baseURL :"http://localhost:3000/api/post",
    withCredentials :true
})

export async function getFeed() {
    const response = await api.get('/feed')
    return response.data
}

export async function getPostDetails(postId) {
    const response = await api.get(`/details/${postId}`)
    return response.data
}

export async function toggleLike(postId) {
    const response = await api.post(`/like/${postId}`)
    return response.data
}
