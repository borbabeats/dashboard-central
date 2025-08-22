import axios from "axios";

const api = axios.create({
    baseURL: "https://institutional-cms.onrender.com/api",
});

export default api;