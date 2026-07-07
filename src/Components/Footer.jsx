import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-500">
      <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 md:px-12">
        <p className="font-medium">
          &copy; {currentYear} Sandeep Pandit. All rights reserved.
        </p>
        <p className="flex items-center gap-1.5 font-medium">
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