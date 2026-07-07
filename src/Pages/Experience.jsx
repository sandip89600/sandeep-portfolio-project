import React from 'react'
import Expreiencedetails from '../Components/ExperienceDetails/Expreiencedetails'
import { ExperienceData } from '../assets/Data'
import { motion } from 'framer-motion'

const Experience = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto max-w-4xl px-6 py-16 md:px-12 w-full flex-grow"
    >
      {/* Page Title */}
      <div className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
          My Journey
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-2 mb-4">
          Professional Experience
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto rounded-full" />
      </div>

      {/* Timeline Wrapper Container */}
      <div className="relative max-w-2xl mx-auto mt-12 pl-2">
        {/* Main Base Timeline Dot Connection Line */}
        <div className="absolute left-[11px] top-6 bottom-6 w-[1.5px] bg-slate-900" />

        {/* Timeline Nodes */}
        <div className="flex flex-col">
          {ExperienceData.map((exp) => (
            <Expreiencedetails key={exp.id} expdata={exp} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Experience