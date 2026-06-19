import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function PendingRequests() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // For entering result — track which request is being updated
  const [resultInput, setResultInput] = useState({})

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    try {
      const response = await api.get('/api/requests')
      setRequests(response.data)
    } catch (err) {
      console.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  // Mark a request as in_progress
  async function handleStart(id) {
    try {
      await api.patch(`/api/requests/${id}`, { status: 'in_progress' })
      setMessage('Request marked as In Progress.')
      loadRequests()
    } catch (err) {
      setMessage('Failed to update status.')
    }
  }

  // Mark as completed with result value
  async function handleComplete(id) {
    const result = resultInput[id]
    if (!result) {
      setMessage('Please enter a result value before completing.')
      return
    }
    try {
      await api.patch(`/api/requests/${id}`, {
        status: 'completed',
        result_value: result,
      })
      setMessage('Request completed successfully!')
      loadRequests()
    } catch (err) {
      setMessage('Failed to complete request.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading requests...</p>

  return (
    <div className="page">
      <div className="navbar">
        <h2>Test Requests</h2>
        <div className="nav-links">
          <span>Tech: {user?.full_name}</span>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      <div className="section">
        {message && <p className="success-msg">{message}</p>}

        {requests.length === 0 ? (
          <p>No pending requests at the moment.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.patient?.full_name}</td>
                  <td>{req.test?.name}</td>
                  <td>{req.doctor?.full_name}</td>
                  <td>
                    <span className={`badge badge-${req.status}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.result_value || '—'}</td>
                  <td>
                    {/* Show Start button only if pending */}
                    {req.status === 'pending' && (
                      <button onClick={() => handleStart(req.id)} className="btn-secondary">
                        Start
                      </button>
                    )}

                    {/* Show result input + complete button if in_progress */}
                    {req.status === 'in_progress' && (
                      <div className="action-group">
                        <input
                          placeholder="Enter result"
                          value={resultInput[req.id] || ''}
                          onChange={(e) =>
                            setResultInput({ ...resultInput, [req.id]: e.target.value })
                          }
                        />
                        <button onClick={() => handleComplete(req.id)} className="btn-primary">
                          Complete
                        </button>
                      </div>
                    )}

                    {/* Show Generate Report if completed */}
                    {req.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/tech/report/${req.id}`)}
                        className="btn-secondary"
                      >
                        Generate Report
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
