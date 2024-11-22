//import { useState } from 'react'
import './App.css'
import Header from "./components/Header/Header.jsx";
import AppRoutes from "./AppRoutes.jsx";
import { UserProvider } from './context/userContext';


function App() {
  //const [count, setCount] = useState(0)

  return (
    <UserProvider>
        <Header />
        <AppRoutes />
    </UserProvider>
  )
}

export default App
