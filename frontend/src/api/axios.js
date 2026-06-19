import axios from 'axios'

// Create one axios instance with the backend URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Before every request, automatically attach the JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
