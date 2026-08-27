import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import LoginPage from "./pages/Login"
import SignupPage from "./pages/Signup"
import Dashboard from "./pages/Dashboard"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App