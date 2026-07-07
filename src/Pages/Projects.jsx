import React from 'react'
import ProjectHeader from '../Components/ProjectDetails/ProjectHeader'
import ProjectDeatils from '../Components/ProjectDetails/ProjectDeatils'
import { ProjectData } from '../assets/Data'
import { motion } from 'framer-motion'

const Projects = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto max-w-7xl px-6 py-8 md:px-12 w-full flex-grow"
    >
      <ProjectHeader />

      <div className="mt-8 mb-16">
        {/* Category Header */}
        <div className="mb-8 border-b border-slate-900 pb-3 flex justify-between items-end">
          <h3 className="text-lg font-bold text-slate-300">
            Static Web Deployments
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {ProjectData.length} Projects Listed
          </span>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ProjectData.map((project) => (
            <ProjectDeatils key={project.id} data={project} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Projects