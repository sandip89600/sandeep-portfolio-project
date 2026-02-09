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
      <div className="border-6 w-90 h-90 rounded-full absolute top-43 right-40 border-orange-500">
      </div>
      <div className="border-6 w-94 h-94 rounded-full absolute top-41 right-38 border-neutral-800">
      </div>
        <img className='w-90 rounded-full ml-40 mt-20 ' src={images.hero} alt="" />
      </div>
    </div>
  )
}

export default Home