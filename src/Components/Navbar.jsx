import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='flex justify-between items-center px-8 py-4 h-16 sticky top-0 bg-slate-950/70 backdrop-blur-md z-10 border-b border-slate-800'>

      <Link to="/">
        <h3 className='bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-bold text-2xl'>Sandeep Pandit</h3>
      </Link>

      <nav>
        <ul className='flex gap-8 text-lg font-semibold'>
          
          <li className='relative group'>
            <Link to="/" className='text-slate-400 hover:text-cyan-400 font-medium transition-colors duration-300'>
              Home
            </Link>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </li>
          
          <li className='relative group'>
            <Link to="/about" className='text-slate-400 hover:text-cyan-400 font-medium transition-colors duration-300'>
              About
            </Link>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </li>

          <li className='relative group'>
            <Link to="/projects" className='text-slate-400 hover:text-cyan-400 font-medium transition-colors duration-300'>
              Projects
            </Link>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </li>
          <li className='relative group'>
            <Link to="/experience" className='text-slate-400 hover:text-cyan-400 font-medium transition-colors duration-300'>
              Experience

            </Link>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </li>

          <li className='relative group'>
            <Link to="/contact" className='text-slate-400 hover:text-cyan-400 font-medium transition-colors duration-300'>
              Contact
            </Link>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </li>

        </ul>
      </nav>
    </div>
  )
}

export default Navbar
