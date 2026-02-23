import React from 'react'

const ProjectDeatils = ({ data }) => {
  return (
    <div className="w-full h-full bg-slate-700 rounded-xl shadow-lg p-6 hover:-translate-y-2 hover:duration-500 hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)">
      <h1 className="text-2xl font-bold text-orange-500">
        {data.projectName}
      </h1>
      <h2 className='pt-4 font-medium text-gray-400'><i>{data.tech}</i></h2>
      <p className='pt-4'>{data.About}</p>
      <li className='pt-2 text-gray-300'>{data.Description1}</li>
      <li className='pt-2 text-gray-300'>{data.Description2}</li>
      <li className='pt-2 text-gray-300 pb-4'>{data.Description3}</li>
      <a href={data.link} target='_blank' className='font-bold text-orange-600'>View Website</a>
    </div>
  )
}


export default ProjectDeatils;