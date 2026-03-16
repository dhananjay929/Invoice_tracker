import axios from 'axios'

// Create a fresh function that always reads token at call time
function getToken() {
  return localStorage.getItem('token')
}

const api = {
  get: (url, config = {}) => axios.get('/api' + url, {
    ...config,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...config.headers }
  }),
  post: (url, data = {}, config = {}) => axios.post('/api' + url, data, {
    ...config,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...config.headers }
  }),
  put: (url, data = {}, config = {}) => axios.put('/api' + url, data, {
    ...config,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...config.headers }
  }),
  delete: (url, config = {}) => axios.delete('/api' + url, {
    ...config,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...config.headers }
  }),
}

export default api