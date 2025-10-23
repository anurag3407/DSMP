import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import UserProfile from './components/UserProfile'
import './App.css'

function App() {
  const [userAddress, setUserAddress] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (address) => {
    setUserAddress(address)
    navigate('/home')
  }

  const handleLogout = () => {
    setUserAddress(null)
    navigate('/login')
  }

  return (
    <div style={{ margin: 0, padding: 0, width: '100%' }}>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/home" element={<HomePage userAddress={userAddress} onLogout={handleLogout} />} />
        <Route path="/profile" element={<UserProfile initialUser={null} posts={[]} onSave={null} userAddress={userAddress} onBack={() => navigate('/home')} />} />
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
      </Routes>
    </div>
  )
}

export default App
