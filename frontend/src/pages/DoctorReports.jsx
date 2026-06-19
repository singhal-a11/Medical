import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function DoctorReports() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    try {
      const response = await api.get('/api/reports')
      setReports(response.data)
    } catch (err) {
      console.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading reports...</p>

  return (
    <div className="page">
      <div className="navbar">
        <h2>Review Patient Reports</h2>
        <div className="nav-links">
          <span>Dr. {user?.full_name}</span>
          <button onClick={() => navigate('/doctor/patients')} className="btn-secondary">
            Patients List
          </button>
          <button onClick={() => navigate('/doctor/request')} className="btn-secondary">
            Create Request
          </button>
          <button onClick={handleLogout} className="btn-danger">
            Logout
          </button>
        </div>
      </div>

      <div className="section">
        <h3>Completed Lab Reports</h3>

        {reports.length === 0 ? (
          <p>No completed reports available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Test</th>
                <th>Category</th>
                <th>Result</th>
                <th>Date Generated</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.test_request?.patient?.full_name}</td>
                  <td>{report.test_request?.test?.name}</td>
                  <td>{report.test_request?.test?.category}</td>
                  <td>
                    <strong>
                      {report.test_request?.result_value} {report.test_request?.test?.unit}
                    </strong>
                  </td>
                  <td>{new Date(report.generated_at).toLocaleString()}</td>
                  <td>
                    <a
                      href={`${import.meta.env.VITE_API_URL}/${report.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary"
                      style={{ display: 'inline-block', textDecoration: 'none' }}
                    >
                      Download PDF
                    </a>
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
