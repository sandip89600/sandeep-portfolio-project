import React from 'react'
import Navbar from './Components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './Pages/Home'
import Projects from './Pages/Projects'
import Contact from './Pages/Contact'
import Experience from './Pages/Experience'
import About from './Pages/About'
import Footer from './Components/Footer'
import { AnimatePresence } from 'framer-motion'
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  const location = useLocation();

  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200'>
      {/* Premium Ambient Background Blobs */}
      <div className="pointer-events-none absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px] animate-pulse-slow" />
      <div className="pointer-events-none absolute bottom-[10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[130px] animate-pulse-slow" />
      <div className="pointer-events-none absolute top-[40%] left-[30%] h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px]" />

      {/* Floating Header */}
      <Navbar />

      {/* Main Pages Layout Container */}
      <main className="relative z-1 flex flex-col min-h-[calc(100vh-64px)]">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path='/' element={<Home />} />
            <Route path='/about' element={<About />} />
            <Route path='/projects' element={<Projects />} />
            <Route path='/experience' element={<Experience />} />
            <Route path='/contact' element={<Contact />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
