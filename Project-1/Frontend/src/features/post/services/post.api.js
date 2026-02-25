import axios from 'axios'

const api = axios.create({
    baseURL :"http://localhost:3000/api/post",
    withCredentials :true
})

export async function getFeed() {
    const response = await api.get('/feed')
    return response.data
}

export async function getAllFeed() {
    const response = await api.get('/all-feed')
    return response.data
}

export async function getLikedPosts() {
    const response = await api.get('/liked')
    return response.data
}

export async function getPostDetails(postId) {
    const response = await api.get(`/details/${postId}`)
    return response.data
}

export async function likePost(postId) {
    const response = await api.post(`/like/${postId}`)
    return response.data
}

export async function unlikePost(postId) {
    const response = await api.delete(`/unlike/${postId}`)
    return response.data
}

export async function addComment(postId, text) {
    const response = await api.post(`/comment/${postId}`, { text })
    return response.data
}

export async function getPostLikes(postId) {
    const response = await api.get(`/likes/${postId}`)
    return response.data
}
