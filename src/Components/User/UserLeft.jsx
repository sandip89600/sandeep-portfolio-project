import React from 'react'
import Button from '../Button/Button'
import { FaLinkedinIn } from "react-icons/fa";
import { FaGithub } from "react-icons/fa6";
import { IoIosMail  } from "react-icons/io";
import { IoMdCall } from "react-icons/io";
import { UserInfo } from '../../assets/Data';
const UserLeft = () => {
  return (
    <div>
        <p className="text-slate-200">Hello</p>
              <h1 className="text-slate-200 font-bold text-5xl mb-3">
  I'm{" "}
  <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">{UserInfo.Name}</span></h1>

              <h3 className='text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 font-extrabold text-4xl mb-3'>{UserInfo.Role}</h3>
              <p className="text-slate-400 font-bold ">{UserInfo.Description}</p>
         <Button/>

        <div className="flex gap-10">
          <a href="https://www.linkedin.com/in/sandippandit/" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn  className='mt-12 text-3xl text-neutral-400 cursor-pointer hover:-translate-y-2 text-slate-400 hover:text-cyan-400 transition-all scale-110'/>
          </a>
          <a href="https://github.com/sandippandit" target="_blank" rel="noopener noreferrer">
            <FaGithub  className='mt-12 text-3xl text-neutral-400 cursor-pointer hover:-translate-y-2 text-slate-400 hover:text-cyan-400 transition-all scale-110'/>
          </a>
          <a href="mailto:sandippandit896@gmail.com">
            <IoIosMail  className='mt-12 text-3xl text-neutral-400 cursor-pointer hover:-translate-y-2 text-slate-400 hover:text-cyan-400 transition-all scale-110'/>
          </a>
          <a href="tel:+910000000000">
            <IoMdCall  className='mt-12 text-3xl text-neutral-400 cursor-pointer hover:-translate-y-2 text-slate-400 hover:text-cyan-400 transition-all scale-110'/>
          </a>
        </div>
        
    </div>
  )
}

export default UserLeft