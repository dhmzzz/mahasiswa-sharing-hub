import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const responseData = error.response?.data;

    // Ambil error validasi Laravel
    if (responseData?.errors) {
      const validationMessages = Object.values(responseData.errors)
        .flat()
        .join(" ");

      return Promise.reject(new Error(validationMessages));
    }

    // Error message biasa dari Laravel
    if (responseData?.message) {
      return Promise.reject(new Error(responseData.message));
    }

    return Promise.reject(
      new Error("Terjadi kesalahan pada server.")
    );
  }
);

export { api };
export default api;