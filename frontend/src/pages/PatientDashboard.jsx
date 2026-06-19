import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [requests, setRequests] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPatientData()
  }, [])

  async function loadPatientData() {
    try {
      const [reqRes, repRes] = await Promise.all([
        api.get('/api/requests'),
        api.get('/api/reports'),
      ])
      setRequests(reqRes.data)
      setReports(repRes.data)
    } catch (err) {
      console.error('Failed to load patient portal data')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Find report file_path for a given request ID
  function getReportPath(requestId) {
    const report = reports.find((r) => r.test_request_id === requestId)
    return report ? report.file_path : null
  }

  if (loading) return <p className="loading">Loading patient portal...</p>

  return (
    <div className="page">
      <div className="navbar">
        <h2>Patient Portal</h2>
        <div className="nav-links">
          <span>Patient: {user?.full_name}</span>
          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>

      <div className="section">
        <h3>My Lab Tests & Reports</h3>

        {requests.length === 0 ? (
          <p>No lab tests requested yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Test Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Result</th>
                <th>Normal Range</th>
                <th>Report PDF</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const reportPath = getReportPath(req.id)
                return (
                  <tr key={req.id}>
                    <td>{req.test?.name}</td>
                    <td>{req.test?.category}</td>
                    <td>
                      <span className={`badge badge-${req.status}`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {req.status === 'completed' ? (
                        <strong>
                          {req.result_value} {req.test?.unit}
                        </strong>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {req.test?.normal_range} {req.test?.unit}
                    </td>
                    <td>
                      {req.status === 'completed' && reportPath ? (
                        <a
                          href={`${import.meta.env.VITE_API_URL}/${reportPath}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-primary"
                          style={{ display: 'inline-block', textDecoration: 'none' }}
                        >
                          Download Report
                        </a>
                      ) : req.status === 'completed' ? (
                        <span className="text-muted">Generating PDF...</span>
                      ) : (
                        <span className="text-muted">Available after completion</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
