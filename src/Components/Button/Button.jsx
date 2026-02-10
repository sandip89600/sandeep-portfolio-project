import React from 'react'
import { Link } from 'react-router-dom'

const Button = () => {
  return (
    <div className='mt-10 flex  gap-4'>
        <Link to="/contact"><button className='bg-orange-500 text-black rounded px-6 py-3 font-semibold cursor-pointer hover:scale-105 hover:shadow-orange-500/40 hover:shadow-lg transition-all duration-300 ease-out'>Get a Project?</button></Link>
        <Link to="https://resume.sandeeppandit.shop/" target=''><button className='border-2 border-orange-500 text-orange-400 bg-transparent px-7 py-3 font-bold rounded cursor-pointer hover:bg-orange-500 hover:text-black hover:scale-105 transition-all duration-300 ease-out'>My Resume</button></Link>
    </div>
  )
}

export default Button