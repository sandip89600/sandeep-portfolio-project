import React from 'react'
import { FaWhatsapp } from 'react-icons/fa6'

const LinkWhatapp = () => {
  return (
    <a
      href="https://wa.me/+917058222107"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex"
    >
      <button className="cursor-pointer flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-emerald-600/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-500 hover:shadow-emerald-500/25">
        <FaWhatsapp className="text-lg" />
        Chat with Us
      </button>
    </a>
  )
}

export default LinkWhatapp