import React from 'react'
import Button from '../Button/Button'
import { FaLinkedinIn, FaGithub, FaWhatsapp } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { IoMdCall } from "react-icons/io";
import { UserInfo } from '../../assets/Data';

const UserLeft = () => {
  const socials = [
    {
      href: "https://www.linkedin.com/in/sandippandit/",
      icon: <FaLinkedinIn className="text-xl" />,
      label: "LinkedIn",
    },
    {
      href: "https://github.com/sandippandit",
      icon: <FaGithub className="text-xl" />,
      label: "GitHub",
    },
    {
      href: "mailto:sandippandit896@gmail.com",
      icon: <IoIosMail className="text-xl" />,
      label: "Email",
    },
    {
      href: "tel:+917058222107",
      icon: <IoMdCall className="text-xl" />,
      label: "Phone",
    },
  ];

  return (
    <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
      {/* Welcome Tag */}
      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-xs font-semibold tracking-widest uppercase text-cyan-400 mb-6">
        Welcome to my space
      </span>

      {/* Main Heading */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">
        Hi, I'm <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">{UserInfo.Name}</span>
      </h1>

      {/* Role Subheading */}
      <h3 className="text-2xl sm:text-3xl font-bold text-slate-300 mb-6">
        {UserInfo.Role}
      </h3>

      {/* Bio Description */}
      <p className="max-w-xl text-base sm:text-lg text-slate-400 font-medium leading-relaxed mb-8">
        {UserInfo.Description}
      </p>

      {/* CTAs */}
      <Button />

      {/* Social Links */}
      <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
        {socials.map((social, idx) => (
          <a
            key={idx}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]"
          >
            {social.icon}
          </a>
        ))}
      </div>
    </div>
  )
}

export default UserLeft