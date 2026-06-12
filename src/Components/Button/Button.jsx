import React from 'react'
import { Link } from 'react-router-dom'

const Button = () => {
  return (
    <div className='mt-10 flex  gap-4'>
        <Link to="/contact"><button className='bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-105 transition-all'>Get a Project?</button></Link>
        <Link to="https://resume.sandeeppandit.shop/" target=''><button className='border border-slate-700 text-slate-200 hover:text-cyan-400 hover:border-cyan-400 px-6 py-2.5 rounded-lg transition-all'>My Resume</button></Link>
    </div>
  )
}

export default Button