import axios from "axios";
import API_BASE_URL from "../../../config/apiBaseUrl";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/post`,
  withCredentials: true,
});

export async function createPostApi({ imageFile, caption }) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("caption", caption || "");

  const response = await api.post("/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
