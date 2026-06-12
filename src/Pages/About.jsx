import React from 'react'


const About = () => {
  const statsData = [
    { percent: '30%', text: 'Increased web traffic by 30% through optimized designs' },
    { percent: '40%', text: 'Improved search visibility by 40% via SEO implementation' },
    { percent: '15%', text: 'Contributed to 15% sales growth through e-commerce development' },
    { percent: '100%', text: 'Maintained 100% project completion rate' }
  ];

  // Services data array
  const servicesData = [
    { icon: 'fa-code', name: 'Website Development' },
    { icon: 'fa-mobile-alt', name: 'App Development' },
    { icon: 'fa-cloud', name: 'Website Hosting' }
  ];

  return (
    <div>
 <section id="about" className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 md:mb-6">
          <span className="bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent">
            About Me
          </span>
        </h2>
        
        {/* Decorative line */}
        <div className="w-20 h-1 bg-orange-500 mx-auto mb-8 md:mb-12 rounded-full"></div>

        {/* About Intro Paragraph */}
        <div className="max-w-3xl mx-auto mb-12 md:mb-16">
          <p className="text-slate-300 text-base md:text-lg lg:text-xl leading-relaxed text-center">
            Currently-learning Full Stack Web Developer with hands-on experience in frontend
            technologies and a proven track record of delivering impactful web solutions. Completed Bachelor Degree
            of Computer Science at <span className="text-orange-400 font-semibold">Bhonsala Military College</span> with practical experience gained through
            internships and project development.
          </p>
        </div>

        {/* Stats Grid - Responsive 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 md:mb-20">
          {statsData.map((stat, idx) => (
            <div 
              key={idx} 
              className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 text-center hover:border-orange-500/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Stat Circle / Percent */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-lg">
                  <span className="text-white font-black text-2xl md:text-3xl">{stat.percent}</span>
                </div>
              </div>
              {/* Stat Text */}
              <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                {stat.text}
              </p>
            </div>
          ))}
        </div>

        {/* Services Offered Section */}
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2">
            What I Do
          </h3>
          <p className="text-slate-400 text-sm md:text-base">Professional services I offer</p>
          <div className="w-16 h-0.5 bg-orange-500 mx-auto mt-3 mb-8"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {servicesData.map((service, idx) => (
            <div 
              key={idx}
              className="group flex flex-col items-center bg-slate-800/40 border border-slate-700 rounded-2xl px-8 py-6 min-w-[160px] hover:border-orange-500/50 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 cursor-default"
            >
              {/* Icon Container - Font Awesome icons (make sure Font Awesome is installed/imported) */}
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl mb-4 group-hover:from-orange-500/20 group-hover:to-orange-600/20 transition-all duration-300">
                <i className={`fas ${service.icon} text-3xl text-orange-500 group-hover:text-orange-400 transition-colors`}></i>
              </div>
              <p className="text-white font-semibold text-base md:text-lg">
                {service.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  )
}

export default About