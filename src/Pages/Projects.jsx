import React, { useState } from 'react'
import ProjectHeader from '../Components/ProjectDetails/ProjectHeader'
import ProjectDeatils from '../Components/ProjectDetails/ProjectDeatils'
import { ProjectData } from '../assets/Data'
const Projects = () => {

  return (
<>
<ProjectHeader/>

<div className="max-w-7xl mx-auto px-6">
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-5">
      {ProjectData.map((project) => (
         <ProjectDeatils key={project.id} data={project}/>
      ))}
   </div>
</div>

</>
  )
}

export default Projects