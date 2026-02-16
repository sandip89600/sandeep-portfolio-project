import React from 'react'
import { images } from '../assets/Data'
import UserLeft from '../Components/User/userLeft'

const Home = () => {
  return (
    <div className='flex'>
      <div className="w-1/2 p-20">
      <UserLeft/>
         </div>
      <div className="w-1/2 h-138">
 
 
        <img className='object-cover  hover:scale-105 duration-400  w-90 rounded-full ml-40 mt-20 ring-8 ring-orange-500 shadow-[0_0_40px_rgba(255,138,0,0.35)] ' src={images.hero} alt="" />
      </div>
    </div>
  )
}

export default Home