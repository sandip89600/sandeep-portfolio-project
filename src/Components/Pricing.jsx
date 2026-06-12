// components/Pricing.jsx
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
        'Basic contact form & Google Maps',
        'Basic on-page SEO'
      ],
      badge: null
    },
    {
      title: '10‑Page Website',
      desc: 'Small business site with more content and basic SEO.',
      price: '₹15,000 - ₹25,000+',
      features: [
        'Content-rich multi-page site',
        'SEO-friendly structure',
        'Faster load & optimizations'
      ],
      badge: 'Popular'
    },
    {
      title: 'Custom / Larger Website',
      desc: 'Advanced features — blogs, database integration, custom modules.',
      price: '₹35,000 - ₹60,000+',
      features: [
        'Custom architecture & CMS',
        'Database & user authentication',
        'Advanced integrations & APIs'
      ],
      badge: 'Enterprise'
    }
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <div className="w-20 h-1 bg-orange-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
            Simple, transparent pricing for medium to large projects. 
            Prices are indicative and may vary based on requirements.
          </p>
        </div>

        {/* Pricing Grid - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, idx) => (
            <div 
              key={idx}
              className={`
                relative bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 lg:p-8 
                border border-slate-700 transition-all duration-300 
                hover:border-orange-500/50 hover:shadow-xl hover:-translate-y-1
                ${plan.badge === 'Popular' ? 'lg:scale-105 border-orange-500/30 shadow-lg' : ''}
              `}
            >
              {/* Popular Badge */}
              {plan.badge === 'Popular' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              {/* Enterprise Badge */}
              {plan.badge === 'Enterprise' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    Best Value
                  </span>
                </div>
              )}

              {/* Plan Title */}
              <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-3">
                {plan.title}
              </h3>
              
              {/* Description */}
              <p className="text-slate-400 text-sm text-center mb-4 min-h-[60px]">
                {plan.desc}
              </p>
              
              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-3xl md:text-4xl font-bold text-orange-500">
                  {plan.price.split(' - ')[0]}
                </span>
                {plan.price.includes('-') && (
                  <span className="text-slate-400 text-lg">
                    {' - '}
                    <span className="text-orange-400 font-semibold">
                      {plan.price.split(' - ')[1]}
                    </span>
                  </span>
                )}
                <p className="text-slate-500 text-xs mt-1">*plus applicable taxes</p>
              </div>
              
              {/* Features List */}
              <ul className="space-y-3 mb-8 min-h-[160px]">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2 text-slate-300 text-sm">
                    <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {/* CTA Button */}
              <a 
                href="#contact" 
                className={`
                  block text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300
                  ${plan.badge === 'Popular' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5' 
                    : 'bg-slate-700 text-white hover:bg-orange-500 hover:shadow-lg transition-all'
                  }
                `}
              >
                {idx === 2 ? 'Get a Quote →' : 'Get Started →'}
              </a>
            </div>
          ))}
        </div>

        {/* Additional Note */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            Need a custom solution? <Link to="/contact" className="text-orange-500 hover:text-orange-400 font-medium">Contact me</Link> for a personalized quote.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;