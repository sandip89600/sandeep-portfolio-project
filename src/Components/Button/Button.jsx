import React from 'react'
import { Link } from 'react-router-dom'

const Button = () => {
  return (
    <div className='mt-8 flex flex-wrap gap-4 justify-center lg:justify-start'>
      {/* Primary CTA */}
      <Link to="/contact">
        <button className="cursor-pointer relative overflow-hidden group rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-6 py-3 text-sm font-semibold tracking-wide text-white shadow-lg shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/25 hover:scale-102">
          Get in Touch
        </button>
      </Link>

      {/* Secondary CTA */}
      <a 
        href="https://resume.sandeeppandit.shop/" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <button className="cursor-pointer rounded-xl border border-slate-800 bg-slate-900/40 px-6 py-3 text-sm font-semibold tracking-wide text-slate-300 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/80 hover:text-white hover:-translate-y-0.5">
          My Resume
        </button>
      </a>
    </div>
  )
}

export default Button