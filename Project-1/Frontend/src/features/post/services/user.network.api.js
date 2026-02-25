import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/users",
  withCredentials: true,
});

export async function getFollowersList(username) {
  const response = await api.get(`/profile/${username}/followers`);
  return response.data;
}

export async function getFollowingList(username) {
  const response = await api.get(`/profile/${username}/following`);
  return response.data;
}
