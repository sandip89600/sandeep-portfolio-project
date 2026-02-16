import React ,{useState} from 'react'

const ProjectHeader = () => {
      const [activeTab, setActiveTab] = useState("All");
  const categories = ['All','HTML/CSS/JS','BOOTSTRAP']
  return (
        <div className='flex flex-col items-center p-10 text-white'>
      <h2 className="text-4xl font-bold mb-6">Projects</h2>
      <div className="flex gap-4">
        {categories.map((cat) =>(
          <button key={cat} onClick={() => setActiveTab(cat)}
          className={`px-6 py-2 rounded-full transition-all duration-300 border font-bold ${
            activeTab === cat ? 'bg-orange-500 border-orange-500 text-white cursor-pointer' 
            :
             'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20 cursor-pointer'
          }`}
          >
            {cat === 'All' ? 'All Project' : cat}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProjectHeader