import React from 'react'
import Button from '../Button/Button'
import { FaLinkedinIn } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import { IoIosMail  } from "react-icons/io";
import { IoMdCall } from "react-icons/io";
const UserLeft = () => {
  return (
    <div>
        <p className="text-neutral-500">Hello</p>
              <h1 className="text-neutral-100 font-bold text-5xl mb-3">
  I'm{" "}
  <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Sandeep Pandit</span></h1>

              <h3 className='text-neutral-100 font-bold text-4xl mb-3'>Full Stack Web Developer</h3>
              <p class="text-neutral-500 font-bold m-5">Currently-learning Full Stack Web Developer with hands-on experience in frontend technologies and a proven track record of delivering impactful web solutions.</p>
         <Button/>

        <div className="flex gap-10">
    <FaLinkedinIn  className='mt-12 text-3xl text-neutral-400 cursor-pointer hover:-translate-y-2 scale-90 hover:text-orange-400 '/>
    <FaGithub  className='mt-12 text-3xl text-neutral-400 cursor-pointer hover:-translate-y-2 scale-90 hover:text-orange-400 '/>
    <IoIosMail  className='mt-12 text-3xl text-neutral-400 cursor-pointer hover:-translate-y-2 scale-90 hover:text-orange-400 '/>
    <IoMdCall  className='mt-12 text-3xl text-neutral-400 cursor-pointer hover:-translate-y-2 scale-90 hover:text-orange-400 '/>
        </div>
    </div>
  )
}

export default UserLeft