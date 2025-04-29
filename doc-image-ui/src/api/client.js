import axios from "axios";
const API = process.env.REACT_APP_API_URL;
export const client = axios.create({ baseURL: API, timeout: 300000 });
