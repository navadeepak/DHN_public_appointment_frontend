import axios from "axios";

const Axiosinstance = axios.create({
  // baseURL: 'http://localhost:3007',
  baseURL: "https://dhnappointment.dentalhealthnet.com/api",
  timeout: 10000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

const AxiosinstanceseconderyBackend = axios.create({
  baseURL: "https://dependencyfordhn.dentalhealthnet.com/api",
});

Axiosinstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("Frontend Request to:", config.url);
    console.log("JWT Sent:", token ? "YES" : "NO");

    return config;
  },
  (error) => Promise.reject(error)
);

Axiosinstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { Axiosinstance, AxiosinstanceseconderyBackend };
