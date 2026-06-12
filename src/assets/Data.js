import image1 from './Images/Image.jpg';
import image2 from './Images/portfolio03.jpeg'
import image3 from './Images/portfolio02.jpeg'
import { Link } from 'react-router-dom';


export const images = {
hero: image1,
}


export const UserInfo = {
  Name: "Sandeep Pandit",
    Role: "Full Stack Web Developer",
    Description: "Currently-learning Full Stack Web Developer with hands-on experience in frontend technologies and a proven track record of delivering impactful web solutions."
}

export const ProjectData = [
    {
        id: 1,
        projectName: 'Food Delivery Application',
        tech: "HTML, CSS, JavaScript, Bootstrap",
        About: "Comprehensive food delivery web application developed as a college project.",
        Description1: "Responsive design compatible across multiple devices",
        Description2: "Intuitive user interface with focus on user experience",
        Description3: "Full project lifecycle management from concept to deployment",
        link: "/"
      },
    {
        id: 2,
        projectName: 'E-commerce Shopping Website',
        portfolio:image3,
        tech: " Bootstrap",
        About: "Fully functional online shopping platform.",
        Description1: "Product catalog, shopping cart, and checkout functionality",
        Description2: "Achieved 15% increase in client sales through optimized UX",
        Description3: "SEO-optimized for improved search engine visibility",
        link: "https://e-commerce-website-xi-lilac.vercel.app/"
    },
    {
      id: 3,
      projectName: 'Personal Portfolio Collection',
      portfolio:image2,
        tech: "HTML, CSS, JavaScript, Bootstrap",
        About: "Multiple portfolio websites showcasing web development skills.",
        Description1: "Optimized designs resulting in 30% increase in web traffic",
        Description2: "Modern web design principles and best practices",
        Description3: "100% project completion rate",
        link: "https://portfolio-project-my-daily-work.vercel.app/"
    }
]


// ExperienceData.js

export const ExperienceData = [
  {
    id: 1,
    title: "Web Development Intern",
    duration: "July 2024 - August 2024",
    company: "My Daily Work Company",
    achievements: [
      "Developed responsive Personal Portfolio website using HTML, CSS, and JavaScript",
      "Created engaging Landing Page with optimized user experience and conversion focus",
      "Built functional Basic Calculator application demonstrating JavaScript proficiency",
      "Collaborated with team to deliver projects within specified timelines"
    ],
    certificate: "https://www.sandeeppandit.shop/Post/index.html"
  },
  {
    id: 2,
    title: "Web Development Intern",
    duration: "November 2024 - January 2025",
    company: "Yhills Edutech Company",
    achievements: [
      "Designed and developed Personal Portfolio showcasing technical capabilities",
      "Created Bootstrap-based e-commerce shopping website with responsive design",
      "Implemented SEO best practices resulting in 40% improvement in search visibility",
      "Contributed to 15% sales growth through optimized e-commerce site development"
    ],
    certificate: "https://www.sandeeppandit.shop/Post/post.html"
  },
  {
    id: 3,
    title: "Full Stack Web Development Program",
    duration: "May 2025 - Present",
    company: "A2Z ITHub",
    achievements: [
      "Currently enrolled in a comprehensive Full Stack Web Development Program",
      "Learning and building projects using HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB",
      "Developing real-world web applications and responsive user interfaces",
      "Expected completion: November 2025"
    ],
    certificate: "#"
  }
];



export const professionServicesTitle = [
  {
    id:"1",
  title:"Professional Services",
  info:"From career tools to full web development—here are the core services I offer, designed for maximum visibility and impact.",
  icon:""
  }

]
export const professionServices = [
  {
    id:"1",
     ProTitle:"Resume Design",
    ProDesc:"ATS-friendly design & tailored content layouts.",
    button:"Design"
  },
  {
    id:"2",
     ProTitle:"Resume Review",
    ProDesc:"Detailed review, keyword optimization & formatting fixes.",
    button:"Review"
  },
  {
    id:"3",
     ProTitle:"Cover Letter",
    ProDesc:"Custom letters to match job descriptions and increase invites.",
    button:"Write"
  },
  {
    id:"4",
     ProTitle:"LinkedIn / Portfolios",
    ProDesc:"Profile copy, project storytelling & SEO optimization.",
    button:"Optimize"
  },
  {
    id:"5",
     ProTitle:"Website — Scratch",
    ProDesc:"Full packages: landing pages, portfolios, or company sites.",
    button:"Start Web"
  },
  {
    id:"6",
     ProTitle:"SEO & Hosting",
    ProDesc:"Setup, UI/UX improvements, hosting & ongoing maintenance.",
    button:"Discuss"
  },
]





export  const technicalSkills = [
  { name: "HTML5", percentage: 90 },
  { name: "CSS3", percentage: 85 },
  { name: "JavaScript", percentage: 75 },
  { name: "Bootstrap", percentage: 80 },
  { name: "React JS", percentage: 88 },
  { name: "Git & GitHub", percentage: 82 },
];