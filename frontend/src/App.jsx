import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  const [route, setRoute] = useState('login') // 'login' | 'home'

  const navigate = (to) => setRoute(to)

  return (
    <div style={{ margin: 0, padding: 0, width: '100%' }}>
      {route === 'login' && <LoginPage onLogin={() => navigate('home')} />}
      {route === 'home' && <HomePage />}
    </div>
  )
}

export default App
