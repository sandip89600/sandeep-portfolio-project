import React ,{useState} from 'react'
import { ProjectData } from '../../assets/Data';

const ProjectHeader = () => {

      // Logic Filter

  
  return (
        <div className='flex flex-col items-center p-8 text-white'>
          <div className="relative pb-7">
            <h1 className="text-4xl font-bold relative inline-block after:content-[''] after:w-12 after:h-0.5 after:bg-orange-500 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-3">
              Projects
            </h1>
          </div>
    </div>
  )
}

export default ProjectHeader