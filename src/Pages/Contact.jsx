import React, { useState } from 'react';

const Contact = () => {
  // 1. State banayein data store karne ke liye
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    try {
      // 2. Apni PHP file ka URL yahan dalein
      const response = await fetch('https://yourdomain.com/send_mail.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status === "success") {
        setStatus("Message Sent Successfully! ✅");
        setFormData({ name: '', email: '', message: '' }); // Form clear karein
      } else {
        setStatus("Error: " + result.message);
      }
    } catch (error) {
      setStatus("Error: Server connect nahi ho raha.");
    }
  };

  return (
    <div className='w-full min-h-screen bg-slate-900 text-white p-10'>
      <div className="text-center w-full">
            <h2 className="text-4xl font-bold relative inline-block after:content-[''] after:w-12 after:h-0.5 after:bg-orange-500 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-2">
              Let's Work Together
            </h2>
        <p className="mt-16 font-semibold text-2xl">
          Ready to bring your web ideas to life with clean, responsive, and optimized <br /> solutions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='flex items-center justify-center flex-col mt-10 gap-6 max-w-2xl mx-auto'>
        <input 
          type="text" 
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full h-14 bg-slate-700 p-5 rounded-2xl font-semibold outline-none focus:ring-2 ring-orange-500" 
          placeholder='Name' 
          required 
        />
        <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full h-14 bg-slate-700 p-5 rounded-2xl font-semibold outline-none focus:ring-2 ring-orange-500" 
          placeholder='Email' 
          required 
        />
        <textarea 
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full h-32 bg-slate-700 p-5 rounded-2xl font-semibold outline-none focus:ring-2 ring-orange-500" 
          placeholder='Tell me About Yourself'
          required
        ></textarea>
        
        <button 
          type="submit"
          className="border-2 border-orange-500 px-4 py-3 rounded-2xl w-full bg-orange-500 font-bold hover:scale-95 transition-all cursor-pointer"
        >
          Send Message
        </button>

        {status && <p className="mt-2 font-medium text-orange-400">{status}</p>}
      </form>
    </div>
  );
};

export default Contact;