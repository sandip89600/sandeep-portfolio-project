import image1 from './Images/Image.jpg';
import { Link } from 'react-router-dom';


export const images = {
    hero: image1,
};


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
        tech: "HTML, CSS, JavaScript, Bootstrap",
        About: "Multiple portfolio websites showcasing web development skills.",
        Description1: "Optimized designs resulting in 30% increase in web traffic",
        Description2: "Modern web design principles and best practices",
        Description3: "100% project completion rate",
        link: "https://portfolio-project-my-daily-work.vercel.app/"
    }
]
