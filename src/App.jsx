import React from 'react'
import Navbar from './Components/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './Pages/Home'
import About from './Pages/About'
import Services from './Pages/Services'
import Projects from './Pages/Projects'
import Blog from './Pages/Blog'
import Contact from './Pages/Contact'

const App = () => {
  return (
    <div className='bg-linear-to-b from-[#0A0F1E] via-[#0E1630] to-[#121C3A] text-white w-screen h-screen'>
      <Navbar/>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/services' element={<Services/>}/>
        <Route path='/project' element={<Projects/>}/>
        <Route path='/blog' element={<Blog/>}/>
        <Route path='/contact' element={<Contact/>}/>
      </Routes>
    </div>
  )
}

export default App