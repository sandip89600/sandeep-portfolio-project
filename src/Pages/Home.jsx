import React from 'react'
import { images } from '../assets/Data'
import UserLeft from '../Components/User/UserLeft'

const Home = () => {
  return (
    <div className='flex flex-col md:flex-row items-center justify-between min-h-screen px-6 md:px-16 lg:px-24'>

      {/* LEFT SECTION */}
      <div className="w-full md:w-1/2 text-center md:text-left mt-10 md:mt-0">
        <UserLeft />
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full md:w-1/2 flex justify-center mt-10 md:mt-0">
        <img
          className='
            w-60 sm:w-72 md:w-80 lg:w-96
            object-cover
            rounded-full
            transition-transform duration-500
            hover:scale-105
            ring-4 md:ring-8 ring-orange-500
            shadow-[0_0_40px_rgba(255,138,0,0.35)]
          '
          src={images.hero}
          alt="Hero"
        />
      </div>

    </div>
  )
}

export default Home