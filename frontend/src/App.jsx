import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  const [route, setRoute] = useState('login') // 'login' | 'home'
  const [userAddress, setUserAddress] = useState(null)

  const navigate = (to) => setRoute(to)

  const handleLogin = async (address) => {
    setUserAddress(address)
    navigate('home')
  }

  const handleLogout = () => {
    setUserAddress(null)
    navigate('login')
  }

  return (
    <div style={{ margin: 0, padding: 0, width: '100%' }}>
      {route === 'login' && <LoginPage onLogin={handleLogin} />}
      {route === 'home' && <HomePage userAddress={userAddress} onLogout={handleLogout} />}
    </div>
  )
}

export default App
