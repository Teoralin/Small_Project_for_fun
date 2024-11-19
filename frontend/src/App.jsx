import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from "./components/Header/Header.jsx";
import AppRoutes from "./AppRoutes.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Header />
      <AppRoutes />
    </>
  )
}

export default App
