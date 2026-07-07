import React from 'react'
import { images } from '../assets/Data'
import UserLeft from '../Components/User/UserLeft'
import Professional from '../Components/Professional/Professional'
import Pricing from '../Components/Pricing'
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full flex-grow"
    >
      {/* Hero Section */}
      <section className="relative mx-auto flex max-w-7xl flex-col-reverse lg:flex-row items-center justify-between px-6 py-16 md:px-12 lg:py-24 gap-12">
        {/* Intro Details */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <UserLeft />
        </div>

        {/* Hero Image Container */}
        <div className="w-full lg:w-1/2 flex justify-center items-center relative">
          {/* Ambient Glowing Background Behind the Avatar */}
          <div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-tr from-cyan-500/20 to-indigo-500/25 blur-3xl opacity-80 animate-pulse-slow w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[420px] md:h-[420px]" />

          {/* Decorative Outer Border Circle */}
          <div className="relative p-2.5 rounded-full border border-slate-800 bg-slate-950/40 backdrop-blur-sm shadow-2xl hover:border-cyan-500/30 transition-colors duration-500">
            {/* Image Wrapper */}
            <div className="w-60 h-60 sm:w-72 sm:h-72 md:w-88 md:h-88 rounded-full overflow-hidden flex items-center justify-center border border-slate-800 bg-slate-900/10">
              <img 
                src={images.hero} 
                alt="Sandeep Pandit Hero Profile" 
                className="w-full h-full object-cover transform hover:scale-105 duration-700 ease-out" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services and Pricing Sections */}
      <Professional />
      <Pricing />
    </motion.div>
  )
}

export default Home
