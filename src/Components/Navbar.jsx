import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='Navbar flex justify-between items-center p-5 h-23 shadow-md/20'>
       <a href="/"><h3 className='font-bold p-20 text-2xl'>Sandeep Pandit</h3></a>
       <nav>
        <ul className='flex gap-8 p-20 text-lg font-semibold'>
            <li className='relative group'><Link to="/" className='text-gray-400 hover:text-white duration-700'>Home</Link><span className="absolute left-0 bottom-0 h-[2px] w-0 bg-orange-500 transition-all duration-400 group-hover:w-full"></span></li>
            <li className='relative group'><Link to="/about" className='text-gray-400 hover:text-white duration-700'>About</Link><span className="absolute left-0 bottom-0 h-[2px] w-0 bg-orange-500 transition-all duration-400 group-hover:w-full"></span></li>
            <li className='relative group'><Link to="/services" className='text-gray-400 hover:text-white duration-700'>Services</Link><span className="absolute left-0 bottom-0 h-[2px] w-0 bg-orange-500 transition-all duration-400 group-hover:w-full"></span></li>
            <li className='relative group'><Link to="/project" className='text-gray-400 hover:text-white duration-700'>Project</Link><span className="absolute left-0 bottom-0 h-[2px] w-0 bg-orange-500 transition-all duration-400 group-hover:w-full"></span></li>
            <li className='relative group'><Link to="/contact" className='text-gray-400 hover:text-white duration-700'>Contact</Link><span className="absolute left-0 bottom-0 h-[2px] w-0 bg-orange-500 transition-all duration-400 group-hover:w-full"></span></li>
        </ul>
       </nav>
    </div>
  )
}

export default Navbar