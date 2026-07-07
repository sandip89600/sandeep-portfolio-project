import React from 'react'

const ProjectHeader = () => {
  return (
    <div className="flex flex-col items-center pt-16 pb-8 text-center px-6">
      <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
        Portfolio Showcases
      </span>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-2 mb-4">
        Featured Projects
      </h2>
      <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto rounded-full" />
    </div>
  )
}

export default ProjectHeader