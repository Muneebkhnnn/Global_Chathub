import axios from "axios"; 
 
// do check here if error
const baseURL=import.meta.env.VITE_DB_URL

const axiosInstance = axios.create({
  baseURL :baseURL ,
  withCredentials:true,
  headers: {
    "Content-Type": "application/json",
  }, 

});

export default axiosInstance;