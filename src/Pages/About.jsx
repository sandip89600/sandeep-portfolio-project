import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { technicalSkills } from '../assets/Data'
import { Coffee, Copy, Check } from 'lucide-react'

const About = () => {
  const [copied, setCopied] = useState(false);
  const handleCopyUpi = () => {
    navigator.clipboard.writeText("sandippandit896@okaxis");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const statsData = [
    { percent: '30%', text: 'Increased web traffic via optimized UX layouts' },
    { percent: '40%', text: 'Improved SEO visibility and search rankings' },
    { percent: '15%', text: 'Client sales growth via e-commerce integrations' },
    { percent: '100%', text: 'Project completion & client satisfaction rate' }
  ];

  const servicesData = [
    { icon: 'fa-code', name: 'Website Development', desc: 'Custom, blazing fast single and multi-page web applications built on React.' },
    { icon: 'fa-mobile-screen-button', name: 'App Development', desc: 'Responsive and adaptive interface designs targeting modern mobile clients.' },
    { icon: 'fa-cloud', name: 'Hosting & Devops', desc: 'Cloud deployments, domain setups, CI/CD pipelines, and maintenance services.' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:py-24 w-full flex-grow"
    >
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
          Get to Know Me
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-2 mb-4">
          About Myself
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto mb-6 rounded-full" />
      </div>

      {/* Intro Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        {/* Paragraph Details */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            A Passionate Full Stack Developer
          </h3>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-6">
            Currently learning and implementing full-stack web architectures, specializing in React, Node, and Tailwind CSS layouts. I hold a Bachelor of Computer Science from{' '}
            <span className="text-cyan-400 font-semibold">Bhonsala Military College</span>, combining formal training with extensive internship projects to create fast, scalable interfaces.
          </p>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            I build with a strong focus on pixel-perfect layouts, responsive utility grids, SEO integrations, and fluid user interaction models. Let's work together to translate your vision into clean, deployable code structures.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {statsData.map((stat, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-slate-900 bg-slate-900/20 p-5 text-center transition-all duration-300 hover:border-cyan-500/25 hover:bg-slate-900/50 hover:shadow-[0_8px_20px_-10px_rgba(34,211,238,0.15)]"
            >
              <h4 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-3xl font-black text-transparent group-hover:scale-105 transition-transform duration-300">
                {stat.percent}
              </h4>
              <p className="text-slate-400 text-xs font-semibold mt-2.5 leading-snug">
                {stat.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Skills Section */}
      <div className="mb-24">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-indigo-400 uppercase">
            My Tooling
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-2">
            Technical Competence
          </h3>
          <div className="w-12 h-0.5 bg-indigo-500 mx-auto mt-3 mb-6" />
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {technicalSkills.map((skill, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-sm font-bold text-slate-200">{skill.name}</span>
                <span className="text-xs font-bold text-cyan-400">{skill.percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${skill.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.05 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div>
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase">
            Services
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-2">
            What I Do
          </h3>
          <div className="w-12 h-0.5 bg-purple-500 mx-auto mt-3 mb-6" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {servicesData.map((service, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center text-center rounded-2xl border border-slate-900 bg-slate-900/20 p-8 hover:border-cyan-500/20 hover:bg-slate-900/40 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-850 bg-slate-900/80 group-hover:border-cyan-500/30 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300">
                <i className={`fa-solid ${service.icon} text-2xl text-cyan-400 group-hover:scale-105 transition-transform`} />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{service.name}</h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Support My Work Section */}
      <div id="support" className="mt-24 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-emerald-400 uppercase">
            Support My Journey
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-2">
            Support My Work
          </h3>
          <div className="w-12 h-0.5 bg-emerald-500 mx-auto mt-3 mb-6" />
          <p className="max-w-xl mx-auto text-sm text-slate-400 leading-relaxed">
            If you enjoy my open-source projects or find my work helpful, consider buying me a coffee or supporting via UPI!
          </p>
        </div>

        <div className="max-w-xl mx-auto rounded-2xl border border-slate-900/80 bg-slate-900/20 p-8 text-center hover:border-cyan-500/15 hover:bg-slate-900/30 transition-all duration-300">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Buy Me A Coffee */}
            <a
              href="https://buymeacoffee.com/sandippandit"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <button className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#ffdd00] px-6 py-3 text-sm font-bold text-slate-950 shadow-md hover:bg-[#ffea00] hover:scale-102 hover:-translate-y-0.5 transition-all duration-300">
                <Coffee className="h-4 w-4" />
                <span>Buy Me a Coffee</span>
              </button>
            </a>

            {/* UPI Support */}
            <button
              onClick={handleCopyUpi}
              className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-6 py-3 text-sm font-semibold text-slate-350 hover:border-slate-700 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>UPI ID Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-slate-450" />
                  <span>Copy UPI ID</span>
                </>
              )}
            </button>
          </div>
          <p className="text-slate-500 text-[11px] mt-4 font-mono">
            UPI ID: sandippandit896@okaxis
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default About