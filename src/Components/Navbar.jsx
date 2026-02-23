import React from 'react'
import { Link } from 'react-router-dom'
import { IoIosHome } from "react-icons/io"
import { FaProjectDiagram } from "react-icons/fa"
import { IoMdContact } from "react-icons/io"

const Navbar = () => {
  return (
    <div className='flex justify-between items-center px-8 py-4 h-16 shadow-md/20 sticky top-0 bg-slate-900 z-10'>
      
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
            <Link to="/experience" className='text-gray-400 text-3xl hover:text-white duration-300'>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
</svg>

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
