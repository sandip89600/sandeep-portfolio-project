import React from 'react'
import Navbar from './Components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Projects from './Pages/Projects'
import Contact from './Pages/Contact'
import Footer from './Components/Footer'
import Experience from './Pages/Experience'

const App = () => {
  return (
    <div className='bg-linear-to-b from-[#0A0F1E] via-[#0E1630] to-[#121C3A] text-white w-full min-h-screen'>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/projects' element={<Projects />} />
        <Route path='/experience' element={<Experience />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
      <Footer/>
    </div>
  )
}

export default App
