import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BASE_URL,
  responseType: "json",
  maxBodyLength: Infinity,
  //timeout: 10000,
});

API.interceptors.request.use(
  (config) => {
    const token = obtenerTuToken();
    //const navigate = useNavigate();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function obtenerTuToken() {
  return localStorage.getItem("tk_pw");
}

export default API;
