import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/users",
  withCredentials: true,
});

export async function getProfile(username) {
  const response = await api.get(`/profile/${username}`);
  return response.data;
}

export async function followUser(username) {
  const response = await api.post(`/follow/${username}`);
  return response.data;
}

export async function unfollowUser(username) {
  const response = await api.post(`/unfollow/${username}`);
  return response.data;
}

export async function updateProfile(payload) {
  const response = await api.patch("/profile/edit", payload);
  return response.data;
}
