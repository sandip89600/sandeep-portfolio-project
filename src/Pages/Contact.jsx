import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, ArrowRight } from 'lucide-react';
import { FaLinkedinIn, FaGithub, FaXTwitter } from 'react-icons/fa6';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setIsSending(true);

    try {
      const response = await fetch('https://yourdomain.com/send_mail.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status === "success") {
        setStatus("success");
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus("error:" + (result.message || "Failed to dispatch message."));
      }
    } catch (error) {
      // Mocking successful client validation if backend endpoint is unavailable
      setStatus("error:Server is offline. Direct Mail me at sandippandit896@gmail.com!");
    } finally {
      setIsSending(false);
    }
  };

  const contactDetails = [
    {
      icon: <Mail className="h-5 w-5 text-cyan-400" />,
      title: 'Email Direct',
      value: 'sandippandit896@gmail.com',
      href: 'mailto:sandippandit896@gmail.com'
    },
    {
      icon: <Phone className="h-5 w-5 text-indigo-400" />,
      title: 'Phone Call',
      value: '+91 70582 22107',
      href: 'tel:+917058222107'
    },
    {
      icon: <MapPin className="h-5 w-5 text-purple-400" />,
      title: 'My Base',
      value: 'Nashik, Maharashtra, India',
      href: '#'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mx-auto max-w-7xl px-6 py-16 md:px-12 lg:py-24 w-full flex-grow"
    >
      {/* Title */}
      <div className="text-center mb-16">
        <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
          Contact Hub
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mt-2 mb-4">
          Let's Work Together
        </h2>
        <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 mx-auto rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Direct Info */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Partner with Sandeep
          </h3>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Ready to bring your web ideas to life with clean, responsive, and SEO-optimized solutions? Send a dispatch message or contact me directly through channels.
          </p>

          <div className="space-y-4 mb-8">
            {contactDetails.map((detail, idx) => (
              <a
                key={idx}
                href={detail.href}
                className="flex items-center gap-4 rounded-xl border border-slate-900 bg-slate-900/10 p-4 transition-all duration-300 hover:border-cyan-500/25 hover:bg-slate-900/35 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 group-hover:border-cyan-500/30 transition-all duration-300">
                  {detail.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {detail.title}
                  </h4>
                  <p className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors duration-300">
                    {detail.value}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Socials Connection */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 pl-1">
              Social Coordinates
            </h4>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/sandippandit/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-850 bg-slate-900/20 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-400 transition-all duration-300"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://github.com/sandippandit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-850 bg-slate-900/20 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-400 transition-all duration-300"
              >
                <FaGithub />
              </a>
              <a
                href="https://x.com/sandippandit896"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-850 bg-slate-900/20 text-slate-400 hover:border-cyan-500/40 hover:text-cyan-400 transition-all duration-300"
              >
                <FaXTwitter />
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-850 bg-slate-900/25 p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="flex flex-col">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 outline-none transition-all duration-300"
                placeholder="e.g. Jane Doe"
                required
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">
                Your Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 outline-none transition-all duration-300"
                placeholder="e.g. jane@company.com"
                required
              />
            </div>

            {/* Message Input */}
            <div className="flex flex-col">
              <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 pl-1">
                Tell me about the project
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 outline-none min-h-[120px] transition-all duration-300"
                placeholder="Tell me what you are looking to build..."
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSending}
              className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-indigo-500/20 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSending ? (
                <span>Sending Message...</span>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>

            {/* Form Response States */}
            {status === 'success' && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center text-xs font-bold tracking-wide text-emerald-400">
                Message Sent Successfully! ✅
              </div>
            )}
            {status.startsWith('error:') && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-center text-xs font-bold tracking-wide text-rose-400">
                {status.replace('error:', '')}
              </div>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;