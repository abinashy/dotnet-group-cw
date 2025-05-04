import { useState } from 'react'
import AuthLayout from './components/Auth/AuthLayout'
import RegisterForm from './components/Auth/RegisterForm'
import LoginForm from './components/Auth/LoginForm'
import './App.css'

function App() {
  const [showLogin, setShowLogin] = useState(true)

  return (
    <AuthLayout>
      {showLogin ? (
        <LoginForm onSwitch={() => setShowLogin(false)} />
      ) : (
        <RegisterForm onSwitch={() => setShowLogin(true)} />
      )}
    </AuthLayout>
  )
}

export default App
