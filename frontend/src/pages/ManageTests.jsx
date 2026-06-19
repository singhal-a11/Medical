import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function ManageTests() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Form state for adding a new test
  const [form, setForm] = useState({
    name: '', category: '', normal_range: '', unit: '', price: ''
  })

  // Load tests when page opens
  useEffect(() => {
    loadTests()
  }, [])

  async function loadTests() {
    try {
      const response = await api.get('/api/tests')
      setTests(response.data)
    } catch (err) {
      console.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  // Update form fields as user types
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleAddTest(e) {
    e.preventDefault()
    try {
      await api.post('/api/tests', {
        ...form,
        price: parseFloat(form.price),
      })
      setMessage('Test added successfully!')
      setForm({ name: '', category: '', normal_range: '', unit: '', price: '' })
      loadTests() // refresh the list
    } catch (err) {
      setMessage('Failed to add test.')
    }
  }

  async function handleDeactivate(id) {
    try {
      await api.delete(`/api/tests/${id}`)
      setMessage('Test deactivated.')
      loadTests()
    } catch (err) {
      setMessage('Failed to deactivate test.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (loading) return <p className="loading">Loading tests...</p>

  return (
    <div className="page">
      <div className="navbar">
        <h2>Manage Lab Tests</h2>
        <div className="nav-links">
          <button onClick={() => navigate('/admin')} className="btn-secondary">
            Dashboard
          </button>
          <button onClick={handleLogout} className="btn-danger">Logout</button>
        </div>
      </div>

      {/* Add Test Form */}
      <div className="section">
        <h3>Add New Test</h3>
        {message && <p className="success-msg">{message}</p>}
        <form onSubmit={handleAddTest} className="inline-form">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Test Name" required />
          <input name="category" value={form.category} onChange={handleChange} placeholder="Category" required />
          <input name="normal_range" value={form.normal_range} onChange={handleChange} placeholder="Normal Range (e.g. 70-110)" />
          <input name="unit" value={form.unit} onChange={handleChange} placeholder="Unit (e.g. mg/dL)" />
          <input name="price" value={form.price} onChange={handleChange} placeholder="Price" type="number" step="0.01" required />
          <button type="submit" className="btn-primary">Add Test</button>
        </form>
      </div>

      {/* Tests Table */}
      <div className="section">
        <h3>All Tests</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Normal Range</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr key={test.id}>
                <td>{test.name}</td>
                <td>{test.category}</td>
                <td>{test.normal_range}</td>
                <td>{test.unit}</td>
                <td>₹{test.price}</td>
                <td>{test.is_active ? '✅ Active' : '❌ Inactive'}</td>
                <td>
                  {test.is_active && (
                    <button onClick={() => handleDeactivate(test.id)} className="btn-danger">
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
