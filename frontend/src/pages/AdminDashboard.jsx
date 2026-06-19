import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch dashboard stats when page loads
  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get('/api/dashboard')
        setStats(response.data)
      } catch (err) {
        console.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading dashboard...</p>

  return (
    <div className="page">
      {/* Top navigation bar */}
      <div className="navbar">
        <h2>Admin Dashboard</h2>
        <div className="nav-links">
          <span>Welcome, {user?.full_name}</span>
          <button onClick={() => navigate('/admin/tests')} className="btn-secondary">
            Manage Tests
          </button>
          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="card">
          <h3>Total Patients</h3>
          <p className="stat-number">{stats?.total_patients ?? 0}</p>
        </div>
        <div className="card">
          <h3>Pending Requests</h3>
          <p className="stat-number">{stats?.requests_by_status?.pending ?? 0}</p>
        </div>
        <div className="card">
          <h3>In Progress</h3>
          <p className="stat-number">{stats?.requests_by_status?.in_progress ?? 0}</p>
        </div>
        <div className="card">
          <h3>Completed</h3>
          <p className="stat-number">{stats?.requests_by_status?.completed ?? 0}</p>
        </div>
      </div>

      {/* Tests by category table */}
      {stats?.tests_by_category && (
        <div className="section">
          <h3>Tests by Category</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.tests_by_category).map(([category, count]) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
