import React from 'react'
import { Link } from 'react-router-dom'
import { IoIosHome } from "react-icons/io"
import { FaProjectDiagram } from "react-icons/fa"
import { IoMdContact } from "react-icons/io"

const Navbar = () => {
  return (
    <div className='flex justify-between items-center px-8 py-4 h-16 shadow-md/20'>
      
      <Link to="/">
        <h3 className='font-bold text-2xl'>Sandeep Pandit</h3>
      </Link>

      <nav>
        <ul className='flex gap-8 text-lg font-semibold'>
          
          <li className='relative group'>
            <Link to="/" className='text-gray-400 text-3xl hover:text-white duration-300'>
              <IoIosHome />
            </Link>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </li>

          <li className='relative group'>
            <Link to="/projects" className='text-gray-400 text-3xl hover:text-white duration-300'>
              <FaProjectDiagram />
            </Link>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </li>

          <li className='relative group'>
            <Link to="/contact" className='text-gray-400 text-3xl hover:text-white duration-300'>
              <IoMdContact />
            </Link>
            <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
          </li>

        </ul>
      </nav>
    </div>
  )
}

export default Navbar
