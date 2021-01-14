import axios from "axios";

const api = axios.create({
    baseURL: "https://api-gobarber.msystem.dev",
});

export default api;
