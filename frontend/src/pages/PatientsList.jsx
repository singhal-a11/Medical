import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function PatientsList() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Form for adding a new patient
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '', phone: '', email: '', address: ''
  })

  useEffect(() => {
    loadPatients()
  }, [])

  async function loadPatients(query = '') {
    try {
      const url = query ? `/api/patients?search=${query}` : '/api/patients'
      const response = await api.get(url)
      setPatients(response.data)
    } catch (err) {
      console.error('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAddPatient(e) {
    e.preventDefault()
    try {
      await api.post('/api/patients', form)
      setMessage('Patient added successfully!')
      setForm({ full_name: '', date_of_birth: '', gender: '', phone: '', email: '', address: '' })
      loadPatients()
    } catch (err) {
      setMessage('Failed to add patient.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading patients...</p>

  return (
    <div className="page">
      <div className="navbar">
        <h2>Patients</h2>
        <div className="nav-links">
          <span>Dr. {user?.full_name}</span>
          <button onClick={() => navigate('/doctor/request')} className="btn-secondary">
            Create Request
          </button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      {/* Add Patient Form */}
      <div className="section">
        <h3>Add New Patient</h3>
        {message && <p className="success-msg">{message}</p>}
        <form onSubmit={handleAddPatient} className="grid-form">
          <div className="form-group">
            <label>Full Name *</label>
            <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full Name" required />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input name="date_of_birth" value={form.date_of_birth} onChange={handleChange} type="date" />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
          </div>
          <button type="submit" className="btn-primary" style={{ gridColumn: 'span 2' }}>
            Add Patient
          </button>
        </form>
      </div>

      {/* Search + Patients Table */}
      <div className="section">
        <h3>Patient List</h3>
        <div className="search-bar">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
          />
          <button onClick={() => loadPatients(search)} className="btn-secondary">Search</button>
          <button onClick={() => { setSearch(''); loadPatients() }} className="btn-secondary">Clear</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.full_name}</td>
                <td>{p.date_of_birth}</td>
                <td>{p.gender}</td>
                <td>{p.phone}</td>
                <td>{p.email}</td>
                <td>
                  <button
                    onClick={() => navigate(`/doctor/request?patient_id=${p.id}`)}
                    className="btn-secondary"
                  >
                    Request Test
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
