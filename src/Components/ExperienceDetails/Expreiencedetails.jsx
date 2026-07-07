import React from 'react'
import { Calendar, Briefcase, FileCheck } from 'lucide-react'

const Expreiencedetails = ({ expdata }) => {
  const hasCertificate = expdata.certificate && expdata.certificate !== '#';

  return (
    <div className="relative pl-10 pb-12 last:pb-4 group">
      {/* Vertical Connection Line - Ends on last node */}
      <div className="absolute left-[11px] top-7 bottom-0 w-[1.5px] bg-slate-800 group-last:hidden" />

      {/* Timeline Bullet Node */}
      <div className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-850 bg-slate-900 shadow-md group-hover:border-cyan-500 group-hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] transition-all duration-300">
        <Briefcase className="h-3.5 w-3.5 text-cyan-400" />
      </div>

      {/* Card Detail Panel */}
      <div className="rounded-2xl border border-slate-850 bg-slate-900/25 p-6 hover:border-cyan-500/25 hover:bg-slate-900/50 hover:shadow-[0_8px_25px_-10px_rgba(34,211,238,0.12)] transition-all duration-300">
        {/* Date Duration */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>{expdata.duration}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-extrabold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-300">
          {expdata.title}
        </h3>

        {/* Company Name */}
        <p className="text-slate-400 text-sm font-semibold mb-5">
          {expdata.company}
        </p>

        {/* Certificate Link */}
        {hasCertificate ? (
          <a
            href={expdata.certificate}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-cyan-400 transition-colors"
          >
            <FileCheck className="h-4 w-4" />
            <span>Verify Certificate &rarr;</span>
          </a>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-655 italic">
            Certificate Pending
          </span>
        )}
      </div>
    </div>
  )
}

export default Expreiencedetails