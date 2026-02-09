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
              <h1 className='text-neutral-100 font-bold text-5xl mb-3'>I'm <span className='text-orange-500  font-bold text-5xl'>Sandeep Pandit</span></h1>
              <h3 className='text-neutral-100 font-bold text-4xl mb-3'>Full Stack Web Developer</h3>
              <p class="text-neutral-500 font-bold mt-10">"Transforming ideas into engaging web experiences."</p>
         <Button/>

        <div className="flex gap-10">
    <FaLinkedinIn  className='mt-12 text-3xl text-neutral-500 cursor-pointer hover:-translate-y-2 scale-90 '/>
    <FaGithub  className='mt-12 text-3xl text-neutral-500 cursor-pointer hover:-translate-y-2 scale-90 '/>
    <IoIosMail  className='mt-12 text-3xl text-neutral-500 cursor-pointer hover:-translate-y-2 scale-90 '/>
    <IoMdCall  className='mt-12 text-3xl text-neutral-500 cursor-pointer hover:-translate-y-2 scale-90 '/>
        </div>
    </div>
  )
}

export default UserLeft