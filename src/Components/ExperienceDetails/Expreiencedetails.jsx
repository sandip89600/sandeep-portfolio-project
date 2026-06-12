import React from 'react'
const Expreiencedetails = ({expdata}) => {
  return (
    <div className="flex justify-center items-center flex-row w-full py-6 " >
        <div className="w-full max-w-3xl border-orange-500 bg-gradient-to-r from-cyan-500 to-blue-600 border border-slate-700 shadow-xl rounded-2xl p-6 mx-4">
        <div className="flex justify-between ">
          
        <h2 className='bg-gradient-to-r from-red-500 to-orange-600  text-white w-fit px-4 py-1 rounded-full font-bold text-sm md:text-base'>{expdata.title}</h2>
        <h3 className='text-orange-400 font-semibold text-sm md:text-base'>{expdata.duration}</h3>
        </div>
        <h2 className='text-xl font-bold text-white mt-4 mb-2'>{expdata.company}</h2>
        
            <a href={expdata.certificate} target="_blank" rel="noreferrer" className="text-orange-500 font-bold hover:underline cursor-pointer">View Certificate →</a>
        </div>      
    </div>
  )
}

export default Expreiencedetails