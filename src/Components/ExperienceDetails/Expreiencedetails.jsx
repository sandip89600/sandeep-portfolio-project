import React from 'react'
const Expreiencedetails = ({expdata}) => {
  return (
    <div>
        <div className='flex items-center justify-center gap-10 flex-col m-10'>
        <div className="w-2/3 h-84 bg-white rounded-2xl">
        <div className="flex justify-between ">
        <h2 className='bg-red-500 w-fit px-3 py-3 m-5 rounded-3xl font-bold'>{expdata.title}</h2>
        <h3 className='text-red-500 font-semibold px-3 py-3 m-5'>{expdata.duration}</h3>
        </div>
        <h2 className='text-black font-semibold m-5'>{expdata.company}</h2>
        <ul className='m-5'>
        <li className='font-medium text-gray-400 ml-5 list-disc'>{expdata.achievements[0]}</li>
        <li className='font-medium text-gray-400 ml-5 list-disc'>{expdata.achievements[1]}</li>
        <li className='font-medium text-gray-400 ml-5 list-disc'>{expdata.achievements[2]}</li>
        <li className='font-medium text-gray-400 ml-5 list-disc'>{expdata.achievements[3]}</li>
        </ul>
            <a href={expdata.certificate} className="text-red-500 font-bold ml-8 cursor-pointer">Certificates</a>
        </div>      
    </div>
    </div>
  )
}

export default Expreiencedetails