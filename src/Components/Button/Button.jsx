import React from 'react'
import { Link } from 'react-router-dom'

const Button = () => {
  return (
    <div className='mt-10 flex  gap-4'>
        <button className='bg-orange-500 px-7 py-3 text-neutral-900 font-bold rounded cursor-pointer hover:scale-90'>Get a Project?</button>
        <Link to="https://resume.sandeeppandit.shop/" target=''><button className='border-2 border-orange-500 text-orange-500 px-7 py-3 font-bold rounded cursor-pointer hover:scale-90'>My Resume</button></Link>
    </div>
  )
}

export default Button