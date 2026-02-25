import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/post",
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
