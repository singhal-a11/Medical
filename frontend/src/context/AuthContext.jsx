import { createContext, useContext, useState } from 'react'

// 1. Create the context (like a global storage box)
const AuthContext = createContext(null)

// 2. Provider wraps the whole app and shares login state to every page
export function AuthProvider({ children }) {
  // Read token and user from localStorage so login persists after refresh
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || 'null')
  )

  // Called after successful login — saves token and user info
  function login(tokenValue, userInfo) {
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userInfo))
    setToken(tokenValue)
    setUser(userInfo)
  }

  // Called on logout — clears everything
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook — any page can call useAuth() to get token, user, login, logout
export function useAuth() {
  return useContext(AuthContext)
}
