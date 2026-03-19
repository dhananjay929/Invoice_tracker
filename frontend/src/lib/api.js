import axios from 'axios'

// Reads from .env file — works both locally and on Vercel
const BASE_URL = import.meta.env.VITE_API_URL

function getToken() {
  return localStorage.getItem('token')
}

const api = {
  get: (url, config = {}) => axios.get(BASE_URL + '/api' + url, {
    ...config,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...config.headers }
  }),
  post: (url, data = {}, config = {}) => axios.post(BASE_URL + '/api' + url, data, {
    ...config,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...config.headers }
  }),
  put: (url, data = {}, config = {}) => axios.put(BASE_URL + '/api' + url, data, {
    ...config,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...config.headers }
  }),
  delete: (url, config = {}) => axios.delete(BASE_URL + '/api' + url, {
    ...config,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...config.headers }
  }),
}

export default api