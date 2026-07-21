import React from 'react'
import { Link } from 'react-router-dom'
import { FaLinkedinIn, FaGithub } from 'react-icons/fa6'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 text-sm text-slate-500">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6 md:px-12">
        {/* Left Column: Copyright */}
        <p className="font-medium order-3 md:order-1">
          &copy; {currentYear} Sandeep Pandit. All rights reserved.
        </p>

        {/* Center Column: Social Coordinates & Support link */}
        <div className="flex flex-wrap items-center justify-center gap-5 order-1 md:order-2">
          <a
            href="https://github.com/sandippandit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Profile"
            className="text-slate-500 hover:text-cyan-400 transition-colors duration-300"
          >
            <FaGithub className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/sandippandit/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn Profile"
            className="text-slate-500 hover:text-cyan-400 transition-colors duration-300"
          >
            <FaLinkedinIn className="h-5 w-5" />
          </a>
          <Link
            to="/about#support"
            className="cursor-pointer inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-800 bg-slate-900/30 text-xs font-semibold text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-300"
          >
            <span>☕ Support My Work</span>
          </Link>
        </div>

        {/* Right Column: Author link */}
        <p className="flex items-center gap-1.5 font-medium order-2 md:order-3">
          Made with <span className="text-indigo-500 animate-pulse">❤️</span> by{' '}
          <a
            href="https://x.com/sandippandit896"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-cyan-400 font-semibold transition-colors duration-300 underline underline-offset-4"
          >
            Sandeep Pandit
          </a>
        </p>
      </div>
    </footer>
  )
}

export default Footer