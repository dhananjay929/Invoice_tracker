import { createContext, useContext, useState } from 'react'
import axios from 'axios'

// ✅ Use env variable
const BASE_URL = import.meta.env.VITE_API_URL

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch { return null }
  })

  const login = async (email, password) => {
    const response = await axios.post(BASE_URL + '/api/auth/login.php',  
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    )
    const { user: u, token } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const register = async (payload) => {
    const response = await axios.post(BASE_URL + '/api/auth/register.php',  
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    )
    const { user: u, token } = response.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(u))
    setUser(u)
    return u
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)