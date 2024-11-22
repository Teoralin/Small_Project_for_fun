import { useState } from 'react'
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
