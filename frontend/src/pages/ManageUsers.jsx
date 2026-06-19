import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ManageUsers() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Form state for creating a user
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'doctor',
  })

  // Load users when page opens
  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const response = await api.get('/api/users')
      setUsers(response.data)
    } catch (err) {
      console.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAddUser(e) {
    e.preventDefault()
    try {
      await api.post('/api/users', form)
      setMessage('User registered successfully!')
      setForm({ full_name: '', email: '', password: '', role: 'doctor' })
      loadUsers() // refresh the list
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setMessage(`Error: ${detail}`)
      } else {
        setMessage('Failed to register user.')
      }
    }
  }

  async function handleToggleActive(id) {
    try {
      await api.patch(`/api/users/${id}/toggle-active`)
      setMessage('User status updated successfully!')
      loadUsers()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') {
        setMessage(`Error: ${detail}`)
      } else {
        setMessage('Failed to update user status.')
      }
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading users...</p>

  return (
    <div className="page">
      <div className="navbar">
        <h2>Manage Users</h2>
        <div className="nav-links">
          <button onClick={() => navigate('/admin')} className="btn-secondary">
            Dashboard
          </button>
          <button onClick={() => navigate('/admin/tests')} className="btn-secondary">
            Manage Tests
          </button>
          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>

      {/* Add User Form */}
      <div className="section">
        <h3>Create New User Account</h3>
        {message && <p className="success-msg">{message}</p>}
        <form onSubmit={handleAddUser} className="inline-form">
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Full Name"
            required
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            type="email"
            required
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            minLength={6}
            required
          />
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="technician">Technician</option>
            <option value="patient">Patient</option>
          </select>
          <button type="submit" className="btn-primary">
            Create User
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="section">
        <h3>All User Accounts</h3>
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                    {u.role}
                  </span>
                </td>
                <td>{u.is_active ? '✅ Active' : '❌ Deactivated'}</td>
                <td>
                  <button
                    onClick={() => handleToggleActive(u.id)}
                    className={u.is_active ? 'btn-danger' : 'btn-primary'}
                  >
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
