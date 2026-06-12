import React from 'react'
import { Link } from 'react-router-dom'

const LinkWhatapp = () => {
  return (
    <>
        <Link to='https://wa.me/705822107' target='_blank'>
          <button className='bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-lg shadow-green-500/20 hover:shadow-green-500/40 hover:scale-105 transition-all'>Chat with Us</button>
        </Link>
    </>
  )
}

export default LinkWhatapp