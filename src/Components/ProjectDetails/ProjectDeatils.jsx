import React from 'react'
import { Link } from 'react-router-dom';

const ProjectDeatils = ({ data }) => {
  return (
    <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg p-6 hover:-translate-y-2 hover:duration-500 hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)">
      <Link to={data.link} target='_blank' className='font-bold text-orange-600'>
        <div className="mb-4 overflow-hidden rounded-lg">
        <img src={data.portfolio}  className="w-full h-48 object-cover rounded-xl" />

      </div>
      <h1 className="text-xl font-bold text-orange-500">
        {data.projectName}
      </h1>
      <h2 className='pt-4 font-semibold text-slate-900'>{data.tech}</h2>

      </Link>
    </div>
  )
}


export default ProjectDeatils;