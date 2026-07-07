import React from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const plans = [
    {
      title: '5‑Page Website',
      desc: 'Basic company website (Home, About, Services, Gallery, Contact).',
      price: '₹7,000 - ₹15,000+',
      features: [
        'Responsive multi-page layout',
        'Basic contact form & Google Maps integration',
        'Basic on-page SEO optimization',
        'Social media links integration'
      ],
      badge: null
    },
    {
      title: '10‑Page Website',
      desc: 'Small business site with content scaling and intermediate SEO setups.',
      price: '₹15,000 - ₹25,000+',
      features: [
        'Content-rich multi-page layout',
        'Intermediate SEO optimization',
        'Optimized performance & assets sizing',
        'Interactive UI components & animations'
      ],
      badge: 'Popular'
    },
    {
      title: 'Custom / Larger Website',
      desc: 'Advanced features — blogs, database operations, user authentication.',
      price: '₹35,000 - ₹60,000+',
      features: [
        'Custom web application architectures',
        'Secure databases & user authentication',
        'API integrations & custom dashboards',
        '1-Month post-launch maintenance'
      ],
      badge: 'Enterprise'
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-slate-950/20 border-t border-slate-900 relative">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
            Flexible Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-2 mb-4">
            Transparent Plans
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto mb-6 rounded-full" />
          <p className="max-w-2xl mx-auto text-base text-slate-400 font-medium">
            Find the perfect web architecture package for your business. Pricing is approximate and scales based on project complexity.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`
                relative flex flex-col justify-between rounded-2xl p-8 
                border transition-all duration-300 hover:-translate-y-1.5
                ${
                  plan.badge === 'Popular'
                    ? 'bg-slate-900/40 border-cyan-500/30 shadow-[0_12px_30px_-10px_rgba(34,211,238,0.15)] md:scale-105'
                    : 'bg-slate-900/20 border-slate-800/80 hover:border-cyan-500/20 hover:bg-slate-900/45 hover:shadow-[0_10px_25px_rgba(0,0,0,0.4)]'
                }
              `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full text-white shadow-md ${
                    plan.badge === 'Popular' 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/20' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-indigo-500/20'
                  }`}>
                    {plan.badge === 'Popular' ? 'Most Popular' : 'Premium choice'}
                  </span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                <p className="text-slate-400 text-xs min-h-[40px] leading-relaxed mb-6">
                  {plan.desc}
                </p>

                {/* Price Display */}
                <div className="mb-8 border-b border-slate-900 pb-6">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-400">
                    {plan.price.split(' - ')[0]}
                  </span>
                  {plan.price.includes('-') && (
                    <span className="text-slate-400 text-sm font-semibold">
                      {' - '}
                      <span className="text-slate-200">
                        {plan.price.split(' - ')[1]}
                      </span>
                    </span>
                  )}
                  <p className="text-slate-500 text-[10px] mt-1.5">*Custom project quotes available</p>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-slate-300 text-xs sm:text-sm">
                      <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <Link
                to="/contact"
                className={`
                  cursor-pointer block text-center py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300
                  ${
                    plan.badge === 'Popular'
                      ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01]'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                  }
                `}
              >
                {idx === 2 ? 'Get a Quote' : 'Choose Package'}
              </Link>
            </div>
          ))}
        </div>

        {/* Custom Solution Callout */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Need customized APIs or dedicated server deployments?{' '}
            <Link to="/contact" className="text-cyan-400 hover:underline transition-all">
              Contact me directly
            </Link>{' '}
            for tailored consulting quotes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;