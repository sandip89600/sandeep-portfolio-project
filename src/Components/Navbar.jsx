import React, { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Projects' },
    { path: '/experience', label: 'Experience' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-2xl font-black tracking-tight text-transparent transition-all group-hover:opacity-85">
            Sandeep Pandit
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.path} className="relative">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm font-semibold tracking-wide transition-colors duration-300 ${
                      isActive
                        ? 'text-cyan-400 font-bold'
                        : 'text-slate-400 hover:text-slate-100'
                    }`
                  }
                >
                  {link.label}
                  {/* Underline on Hover/Active */}
                  <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 group-hover:w-full"></span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Hamburger Trigger */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-slate-900 bg-slate-950/95 md:hidden"
          >
            <nav className="px-6 py-6">
              <ul className="flex flex-col gap-5">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <NavLink
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `block text-lg font-medium transition-colors ${
                          isActive
                            ? 'text-cyan-400 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navbar
