import React from 'react'
import { FaGithub } from 'react-icons/fa6'
import { ExternalLink } from 'lucide-react'

const ProjectDeatils = ({ data }) => {
  // Parse tech stack comma-separated string into visual tags
  const techTags = data.tech ? data.tech.split(',').map(t => t.trim()) : [];

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/85 bg-slate-900/30 p-5 transition-all duration-500 hover:-translate-y-2 hover:border-cyan-500/30 hover:bg-slate-900/60 hover:shadow-[0_12px_30px_-10px_rgba(34,211,238,0.15)]">
      {/* Background Hover Glow Accent */}
      <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-cyan-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-5 group-hover:from-cyan-500 group-hover:to-indigo-500 transition-all duration-700" />

      <div>
        {/* Project Thumbnail */}
        <div className="mb-5 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950">
          <img
            src={data.portfolio}
            alt={`${data.projectName} mock`}
            className="w-full h-44 object-cover transform scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
        </div>

        {/* Project Title */}
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
          {data.projectName}
        </h3>

        {/* Technical Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {techTags.map((tech, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full border border-cyan-500/10 bg-cyan-500/5 text-[10px] font-bold tracking-wider text-cyan-400"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* External Action Buttons */}
      <div className="flex gap-3">
        {/* Source Code */}
        <a
          href={data.github || "https://github.com/sandippandit"}
          target="_blank"
          rel="noopener noreferrer"
          className="w-1/2"
        >
          <button className="cursor-pointer w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-805 bg-slate-950/20 text-xs font-bold uppercase tracking-wider text-slate-400 transition-all duration-300 hover:border-slate-700 hover:text-white hover:bg-slate-900/60">
            <FaGithub className="h-3.5 w-3.5" />
            Code
          </button>
        </a>

        {/* Live Demo */}
        <a
          href={data.link}
          target="_blank"
          rel="noopener noreferrer"
          className="w-1/2"
        >
          <button className="cursor-pointer w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-800 bg-slate-955/50 text-xs font-bold uppercase tracking-wider text-slate-400 transition-all duration-300 group-hover:border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-slate-950">
            <ExternalLink className="h-3.5 w-3.5" />
            Demo
          </button>
        </a>
      </div>
    </div>
  )
}

export default ProjectDeatils;