import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function GenerateReport() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { requestId } = useParams() // get the request ID from the URL

  const [requestData, setRequestData] = useState(null)
  const [reportPath, setReportPath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState('')

  // Load request details when page opens
  useEffect(() => {
    async function loadRequest() {
      try {
        const response = await api.get(`/api/requests/${requestId}`)
        setRequestData(response.data)
      } catch (err) {
        console.error('Failed to load request')
      } finally {
        setLoading(false)
      }
    }
    loadRequest()
  }, [requestId])

  async function handleGenerate() {
    setGenerating(true)
    setMessage('')
    try {
      const response = await api.post(`/api/reports/generate/${requestId}`)
      setReportPath(response.data.file_path)
      setMessage('✅ Report generated successfully!')
    } catch (err) {
      setMessage('❌ Failed to generate report. It may already exist.')
    } finally {
      setGenerating(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading request details...</p>

  return (
    <div className="page">
      <div className="navbar">
        <h2>Generate Report</h2>
        <div className="nav-links">
          <button onClick={() => navigate('/tech/requests')} className="btn-secondary">
            Back to Requests
          </button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      <div className="section">
        <div className="form-card">
          <h3>Request Details</h3>

          {requestData && (
            <table className="details-table">
              <tbody>
                <tr>
                  <td><strong>Patient</strong></td>
                  <td>{requestData.patient?.full_name}</td>
                </tr>
                <tr>
                  <td><strong>Test</strong></td>
                  <td>{requestData.test?.name}</td>
                </tr>
                <tr>
                  <td><strong>Category</strong></td>
                  <td>{requestData.test?.category}</td>
                </tr>
                <tr>
                  <td><strong>Result</strong></td>
                  <td>{requestData.result_value}</td>
                </tr>
                <tr>
                  <td><strong>Normal Range</strong></td>
                  <td>{requestData.test?.normal_range} {requestData.test?.unit}</td>
                </tr>
                <tr>
                  <td><strong>Status</strong></td>
                  <td>{requestData.status}</td>
                </tr>
              </tbody>
            </table>
          )}

          {message && <p className="success-msg">{message}</p>}

          {/* Generate button */}
          {!reportPath && (
            <button
              onClick={handleGenerate}
              className="btn-primary"
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate PDF Report'}
            </button>
          )}

          {/* Download link after report is generated */}
          {reportPath && (
            <a
              href={`${import.meta.env.VITE_API_URL}/${reportPath}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ display: 'inline-block', marginTop: '12px' }}
            >
              Download Report PDF
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
