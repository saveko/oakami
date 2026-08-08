import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reviews" element={<ReviewInbox />} />
        <Route path="/reviews/:id" element={<ReviewDetail />} />
        <Route path="/approve" element={<ManagerApproval />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

// Placeholder components
function Dashboard() { return <div>Dashboard - Implementation pending</div> }
function Login() { return <div>Login - Implementation pending</div> }
function ReviewInbox() { return <div>Review Inbox - Implementation pending</div> }
function ReviewDetail() { return <div>Review Detail - Implementation pending</div> }
function ManagerApproval() { return <div>Manager Approval - Implementation pending</div> }
function Reports() { return <div>Reports - Implementation pending</div> }
function Settings() { return <div>Settings - Implementation pending</div> }

export default App
