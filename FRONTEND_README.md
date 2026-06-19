# Medical Laboratory Management System — Frontend README

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [How Authentication Works](#4-how-authentication-works)
5. [Page-by-Page Workflow](#5-page-by-page-workflow)
6. [How Frontend Talks to Backend](#6-how-frontend-talks-to-backend)
7. [Key Files Explained](#7-key-files-explained)

---

## 1. Project Overview

This is the frontend for the Medical Laboratory Management System.
It is a React web application that allows different types of users (Admin, Doctor, Technician) to interact with the backend API.

Each role has their own set of pages and can only access what they are allowed to see.

---

## 2. Tech Stack

| Technology        | Version  | Purpose                                      |
|-------------------|----------|----------------------------------------------|
| React             | 18       | Build UI components and pages                |
| Vite              | 5        | Fast development server and build tool       |
| React Router DOM  | 6        | Navigate between pages without page reload   |
| Axios             | 1.x      | Make HTTP requests to the FastAPI backend    |
| Context API       | Built-in | Store logged-in user info globally           |
| Plain CSS         | —        | Style all pages and components               |

---

## 3. Folder Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── api/
│   │   └── axios.js              # Axios setup — base URL + token interceptor
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Global login state — user info + token
│   │
│   ├── pages/
│   │   ├── LoginPage.jsx         # Login form for all roles
│   │   ├── AdminDashboard.jsx    # Admin: stats overview
│   │   ├── ManageTests.jsx       # Admin: view, add, deactivate lab tests
│   │   ├── PatientsList.jsx      # Doctor: view and add patients
│   │   ├── CreateRequest.jsx     # Doctor: create a new test request
│   │   ├── PendingRequests.jsx   # Technician: view and update test requests
│   │   └── GenerateReport.jsx    # Technician: generate and download PDF report
│   │
│   ├── App.jsx                   # All routes defined here
│   ├── main.jsx                  # Entry point — mounts App to DOM
│   └── index.css                 # All global styles
│
├── .env                          # VITE_API_URL=http://localhost:8000
├── index.html
└── package.json
```

---

## 4. How Authentication Works

### Login Flow (Step by Step)

```
1. User opens http://localhost:5173
2. App.jsx redirects to /login if no token found
3. User types email and password in LoginPage
4. Axios sends: POST http://localhost:8000/api/auth/login
5. Backend checks credentials and returns:
   {
     "access_token": "eyJhbGci...",
     "token_type": "bearer",
     "role": "admin",
     "full_name": "Dr. Sharma"
   }
6. Token is saved to localStorage (persists after browser refresh)
7. User info is saved to AuthContext (available to all pages)
8. React redirects user to their role-specific dashboard:
   - admin   → /admin
   - doctor  → /doctor/patients
   - technician → /tech/requests
```

### Token Usage on Every Request

```
Every time a page calls the backend:
  axios.js interceptor automatically adds:
  Header: Authorization: Bearer eyJhbGci...

Backend reads this header, verifies the token, and allows the request.
If token is missing or expired → backend returns 401 → user is redirected to login.
```

### Logout Flow

```
1. User clicks Logout button in Navbar
2. localStorage.removeItem("token") — token deleted
3. AuthContext clears user info
4. React Router redirects to /login
```

---

## 6. Page-by-Page Workflow

---

### LoginPage.jsx
**URL**: `/login`
**Accessible by**: Everyone (public page)

**Workflow**:
1. User fills in email and password
2. Clicks Login button
3. Axios POST to `/api/auth/login`
4. On success: save token, redirect to dashboard
5. On failure: show error message "Invalid credentials"

---

### AdminDashboard.jsx
**URL**: `/admin`
**Accessible by**: Admin only

**Workflow**:
1. Page loads → useEffect runs → Axios GET `/api/dashboard`
2. Backend returns:
   - Total patients count
   - Test requests grouped by status (pending, in_progress, completed)
   - Tests grouped by category
3. Page displays all stats in cards/tables
4. Navbar links to ManageTests page

---

### ManageTests.jsx
**URL**: `/admin/tests`
**Accessible by**: Admin only

**Workflow**:
1. Page loads → fetch all tests from GET `/api/tests`
2. Display tests in a table (name, category, price, normal range, status)
3. Admin fills "Add Test" form → POST `/api/tests`
4. New test appears in the table
5. Admin clicks Deactivate → DELETE `/api/tests/{id}` (soft delete, sets is_active=False)

---

### PatientsList.jsx
**URL**: `/doctor/patients`
**Accessible by**: Doctor

**Workflow**:
1. Page loads → fetch patients from GET `/api/patients`
2. Display in a table (name, DOB, gender, phone, email)
3. Doctor fills "Add Patient" form → POST `/api/patients`
4. Search box → GET `/api/patients?search=name` filters results
5. Click "Create Request" button next to patient → goes to CreateRequest page

---

### CreateRequest.jsx
**URL**: `/doctor/request`
**Accessible by**: Doctor

**Workflow**:
1. Page loads → fetch patients list + tests catalog in parallel
2. Doctor selects a patient from dropdown
3. Doctor selects a test from dropdown
4. Clicks Submit → POST `/api/requests`
   ```json
   { "patient_id": 3, "test_id": 7 }
   ```
5. Backend auto-sets doctor_id from the JWT token
6. Request created with status = "pending"
7. Success message shown

---

### PendingRequests.jsx
**URL**: `/tech/requests`
**Accessible by**: Technician

**Workflow**:
1. Page loads → fetch requests from GET `/api/requests`
   (Backend filters: technician only sees pending and in_progress requests)
2. Table shows: patient name, test name, doctor name, current status
3. Technician clicks "Start" → PATCH `/api/requests/{id}`
   ```json
   { "status": "in_progress" }
   ```
4. Technician enters result value → PATCH `/api/requests/{id}`
   ```json
   { "status": "completed", "result": "120", "completed_at": "2026-06-19T10:00:00" }
   ```
5. Completed requests show a "Generate Report" button

---

### GenerateReport.jsx
**URL**: `/tech/report/:requestId`
**Accessible by**: Technician

**Workflow**:
1. Technician clicks "Generate Report" from PendingRequests page
2. Page shows test request details (patient, test, result)
3. Technician clicks "Generate PDF" button
4. Axios POST `/api/reports/generate/{request_id}`
5. Backend creates PDF and saves it to disk
6. Backend returns `{ "file_path": "reports/report_42.pdf" }`
7. Page shows a "Download Report" link
8. Click Download → browser opens/downloads the PDF from `/reports/report_42.pdf`

---

## 7. How Frontend Talks to Backend

### axios.js Setup

```javascript
import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL  // reads from .env file
})

// Before every request → attach the JWT token automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
```

### How Every Page Uses It

```javascript
// GET request — fetch data
const response = await api.get('/api/patients')
setPatients(response.data)

// POST request — send new data
await api.post('/api/patients', { full_name: "Rahul", gender: "Male" })

// PATCH request — update existing data
await api.patch(`/api/requests/${id}`, { status: "completed", result: "120" })

// DELETE request — remove data
await api.delete(`/api/tests/${id}`)
```

---

## 7. Key Files Explained

### `main.jsx`
Entry point. Wraps the entire app inside `AuthProvider` so all pages can access login state.
```jsx
ReactDOM.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <App />
    </AuthProvider>
)
```

### `AuthContext.jsx`
Stores user info globally.
```jsx
// What it provides to all pages:
const { user, token, login, logout } = useAuth()
// user.role, user.full_name, token
```

### `App.jsx`
Defines all URL routes.
```jsx
<Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/admin/tests" element={<ManageTests />} />
    <Route path="/doctor/patients" element={<PatientsList />} />
    <Route path="/doctor/request" element={<CreateRequest />} />
    <Route path="/tech/requests" element={<PendingRequests />} />
    <Route path="/tech/report/:id" element={<GenerateReport />} />
</Routes>
```

---

## Important Notes

- Never commit the `.env` file with real secrets
- The `venv/` folder should never be copied — regenerate on each machine
- Backend must be running before starting the frontend
- CORS is already configured in backend for `http://localhost:5173`
- PDF files are served directly from backend at `http://localhost:8000/reports/`
