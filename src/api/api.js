import axios from "axios";

const api = axios.create({
    baseURL: 'https://institutional-cms.onrender.com/api'//"http://localhost:3000/api"
});

export default api;