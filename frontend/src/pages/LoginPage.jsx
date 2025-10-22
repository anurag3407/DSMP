import React from 'react'
import LoginPageHeader from '../components/LoginPageHeader'
import LoginPageBody from '../components/LoginPageBody'

const LoginPage = ({ onLogin }) => {
  return (
    <div style={{ margin: 0, padding: 0, width: '100%' }}>
      <LoginPageHeader />
      <LoginPageBody onLogin={onLogin} />
    </div>
  )
}

export default LoginPage