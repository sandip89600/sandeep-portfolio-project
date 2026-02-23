import React from 'react'
import Expreiencedetails from '../Components/ExperienceDetails/Expreiencedetails'
import { ExperienceData } from '../assets/Data'


const Experience = () => {
  return (
    <div className="">
      <div className="text-center mt-10 mb-5">
         <h2 className="text-4xl font-bold relative inline-block after:content-[''] after:w-12 after:h-0.5 after:bg-orange-500 after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-3">
          My Experience
        </h2>
      </div>
      {ExperienceData.map((exp) =>(
        <Expreiencedetails key={exp.id} expdata={exp} />
      ))}
    </div>
  )
}

export default Experience