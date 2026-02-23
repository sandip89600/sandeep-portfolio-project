import React ,{useState} from 'react'
import { ProjectData } from '../../assets/Data';

const ProjectHeader = () => {

      // Logic Filter

  
  return (
        <div className='flex flex-col items-center p-8 text-white'>
          <div className="relative pb-7">
            <h1 className="font-bold text-4xl relative after:content-[''] after:w-12 after:h-1 after:bg-orange-500 after:absolute after:left-12 after:-bottom-5">
              Projects
            </h1>
          </div>
    </div>
  )
}

export default ProjectHeader