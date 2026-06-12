import React from 'react'
import Navbar from './Components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import Projects from './Pages/Projects'
import Contact from './Pages/Contact'
import Experience from './Pages/Experience'
import About from './Pages/About'
import Footer from './Components/Footer'
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  return (
    <div className='bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950  text-white w-full min-h-screen'>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About/>} />
        <Route path='/projects' element={<Projects />} />
        <Route path='/experience' element={<Experience />} />
        <Route path='/contact' element={<Contact />} />
      </Routes>
      <Footer/>
      </div>
  )
}

export default App
