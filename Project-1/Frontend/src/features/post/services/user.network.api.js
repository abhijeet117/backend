import axios from "axios";
import API_BASE_URL from "../../../config/apiBaseUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/users`,
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
