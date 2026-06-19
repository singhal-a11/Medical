import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function CreateRequest() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [searchParams] = useSearchParams()

  const [patients, setPatients] = useState([])
  const [tests, setTests] = useState([])
  const [patientId, setPatientId] = useState(searchParams.get('patient_id') || '')
  const [testId, setTestId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Load both patients and tests when page opens
  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, tRes] = await Promise.all([
          api.get('/api/patients'),
          api.get('/api/tests'),
        ])
        setPatients(pRes.data)
        setTests(tRes.data)
      } catch (err) {
        console.error('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await api.post('/api/requests', {
        patient_id: parseInt(patientId),
        test_id: parseInt(testId),
      })
      setMessage('✅ Test request created successfully!')
      setPatientId('')
      setTestId('')
    } catch (err) {
      setMessage('❌ Failed to create request. Please try again.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading...</p>

  return (
    <div className="page">
      <div className="navbar">
        <h2>Create Test Request</h2>
        <div className="nav-links">
          <button onClick={() => navigate('/doctor/patients')} className="btn-secondary">
            Back to Patients
          </button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      <div className="section">
        <div className="form-card">
          <h3>New Test Request</h3>
          {message && <p className="success-msg">{message}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Patient *</label>
              <select value={patientId} onChange={(e) => setPatientId(e.target.value)} required>
                <option value="">-- Choose a patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Test *</label>
              <select value={testId} onChange={(e) => setTestId(e.target.value)} required>
                <option value="">-- Choose a test --</option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.category} (₹{t.price})
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary">Submit Request</button>
          </form>
        </div>
      </div>
    </div>
  )
}
