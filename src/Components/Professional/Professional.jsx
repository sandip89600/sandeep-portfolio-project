import React from 'react'
import { professionServicesTitle,professionServices } from '../../assets/Data'
import LinkWhatapp from '../Button/LinkWhatapp'
import {NotebookPen,ZoomIn,MailOpen,IdCardLanyard,ChevronsLeftRightEllipsis,SearchCode} from 'lucide-react'


const Professional = () => {
  return (
    <>
         <section className='w-full py-20 '>
          {professionServicesTitle.map((info,idx) =>(
        <div className="text-center" key={idx}>
                      <h1 className="text-white text-4xl font-bold relative inline-block after:content-[''] after:w-12 after:h-0.5 after:bg-orange-500 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-3">{info.title}</h1>
                      <p className='mt-10 font-bold text-slate-500 '>{info.info}</p>
                    
                    <div className="flex flex-wrap items-center justify-center gap-6 mt-16">
                    {professionServices.map((val, index) =>(
                      <div className="bg-[#13213d] border border-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-orange-500/10 transition-all duration-300 w-full max-w-sm text-left group" key={index}>
                        <h2 className='text-2xl font-semibold text-white mb-4 group-hover:text-orange-500 transition-colors'>{val.ProTitle}</h2>
                        <p className='text-slate-400 mb-6 leading-relaxed'>{val.ProDesc}</p>
                       <a href="https://wa.me/+917058222107" target='_blank'> <button className='border cursor-pointer border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-2 rounded-full font-medium transition-all'>{val.button}</button></a>
                      </div>
                    ))}
                    </div>
        </div>
          ))}
      </section>
    </>
  )
}

export default Professional