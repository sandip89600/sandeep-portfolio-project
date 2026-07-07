import React from 'react'
import { professionServicesTitle, professionServices } from '../../assets/Data'
import { NotebookPen, ZoomIn, MailOpen, IdCardLanyard, ChevronsLeftRightEllipsis, SearchCode } from 'lucide-react'

const Professional = () => {
  // Map icons to the services based on their index
  const getIcon = (idx) => {
    const icons = [
      <NotebookPen className="h-6 w-6 text-cyan-400" />,
      <ZoomIn className="h-6 w-6 text-indigo-400" />,
      <MailOpen className="h-6 w-6 text-purple-400" />,
      <IdCardLanyard className="h-6 w-6 text-pink-400" />,
      <ChevronsLeftRightEllipsis className="h-6 w-6 text-teal-400" />,
      <SearchCode className="h-6 w-6 text-emerald-400" />
    ];
    return icons[idx % icons.length];
  };

  return (
    <section className="w-full py-20 bg-slate-950/40 relative border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {professionServicesTitle.map((info, idx) => (
          <div className="text-center" key={idx}>
            {/* Header */}
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
              Services Offered
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-2 mb-4">
              {info.title}
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto mb-6 rounded-full" />
            <p className="max-w-xl mx-auto text-base text-slate-400 font-medium mb-16 leading-relaxed">
              {info.info}
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionServices.map((val, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col justify-between items-start rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-cyan-500/30 hover:bg-slate-900/60 hover:shadow-[0_12px_30px_-10px_rgba(34,211,238,0.1)]"
                >
                  {/* Glowing Accent Ring on Hover */}
                  <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-tr from-cyan-500/0 to-indigo-500/0 opacity-0 group-hover:opacity-10 group-hover:from-cyan-500/10 group-hover:to-indigo-500/10 transition-all duration-500" />

                  <div className="w-full">
                    {/* Icon Circle */}
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/60 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300">
                      {getIcon(index)}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                      {val.ProTitle}
                    </h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                      {val.ProDesc}
                    </p>
                  </div>

                  {/* WhatsApp CTA Button */}
                  <a
                    href="https://wa.me/+917058222107"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <button className="cursor-pointer w-full text-center py-2.5 rounded-xl border border-slate-800 bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-300 transition-all duration-300 group-hover:border-cyan-500/40 group-hover:bg-cyan-500 group-hover:text-slate-950">
                      {val.button} &rarr;
                    </button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Professional