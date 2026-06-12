import React from 'react'
import { images } from '../assets/Data'
import UserLeft from '../Components/User/UserLeft'
import Professional from '../Components/Professional/Professional'
import Pricing from '../Components/Pricing'

const Home = () => {
  return (
    <>
      <section className='flex flex-col-reverse lg:flex-row items-center justify-between min-h-[calc(100vh-80px)] px-6 md:px-12 lg:px-20 py-10 gap-10'>
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <UserLeft />
        </div>
        <div className="w-full lg:w-1/2 flex justify-center items-center">
        <img src={images.bg} className='relative left-[350px] top-[90px]' alt="" />
          <img className='object-cover hover:scale-105 duration-500 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 z-1'  src={images.hero} alt="Hero" />
        </div>
      </section>
<Professional/> 
<Pricing/>
    </>
  )
}

export default Home
