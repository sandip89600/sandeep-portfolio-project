import React from 'react'
import Navbar from './Components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Projects from './Pages/Projects'
import Contact from './Pages/Contact'

const App = () => {
  return (
    <div className='bg-linear-to-b from-[#0A0F1E] via-[#0E1630] to-[#121C3A] text-white w-screen min-h-screen'>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/projects' element={<Projects />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
    </div>
  )
}

export default App
