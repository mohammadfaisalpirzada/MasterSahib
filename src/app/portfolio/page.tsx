'use client'
import React, { useState } from 'react';
import Image from 'next/image';

const PortfolioPage = () => {
  const [activeSection, setActiveSection] = useState('about');

  // Type 'sectionId' as a string to fix the TypeScript error
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className="min-h-screen bg-blue-200">
      {/* Section Navigation Buttons */}
      <div className="bg-white shadow-md p-3 mt-0">
        <div className="flex flex-wrap gap-2 justify-center">
          {['about', 'education', 'skills', 'experience', 'interests'].map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${activeSection === section 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mt-5 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Muhammad Faisal Peerzada
            </h1>
            <div className="text-gray-600">
              <p>Address: Saddar, Karachi, Pakistan</p>
              <p>Phone: +92 345 8340669</p>
              <p>Email: mohammadfaisalpirzada@gmail.com</p>
            </div>
          </div>
          <div className="mt-6 md:mt-6">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-blue-600 shadow-lg">
              <Image
                src="/images/profile.jpg"
                alt="Muhammad Faisal Peerzada" 
                width={280} 
                height={280}
                className="w-full h-full object-cover"
              />

            </div>
          </div>
        </header>

        {/* About Section */}
        <section id="about" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional Summary</h2>
          <p className="text-gray-600 leading-relaxed">
            Education professional and freelancer with over 20 years of expertise in teaching Mathematics 
            and Physics, curriculum development, and department management. Currently working as a freelance 
            education consultant — developing plans, curriculums, and academic frameworks for schools including 
            Meezan School, Daniyal Montessori Academy, and others. A tech-savvy professional with 
            a passion for integrating digital tools into education, adept at handling online education 
            platforms and fostering innovative learning environments. Committed to lifelong learning 
            and excellence in education.
          </p>
        </section>

        {/* Education Section */}
        <section id="education" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Education</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">Master of Arts in Distance and Formal Education</h3>
              <p className="text-gray-600">Allama Iqbal Open University</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">Bachelor of Education</h3>
              <p className="text-gray-600">University of Karachi</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">Bachelor of Arts</h3>
              <p className="text-gray-600">University of Karachi</p>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Curriculum & Plan Development</h3>
              <p className="text-gray-600">Designing academic plans, curriculums, assessment systems, and teaching frameworks for schools (Meezan, Daniyal Montessori, etc.)</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Software Proficiency</h3>
              <p className="text-gray-600">Microsoft Office (Word, Excel, Visio), Adobe Illustrator, Photoshop, Canva, and Serif</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Digital Communication</h3>
              <p className="text-gray-600">Managing Facebook pages, WhatsApp communities, and running ads</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Education Technology</h3>
              <p className="text-gray-600">Online Education Management with platforms like Zoom, and building educational web apps</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Department Management</h3>
              <p className="text-gray-600">Leading secondary departments, coordinating teachers, aligning Cambridge & local standards</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-2">Language Skills</h3>
              <p className="text-gray-600">Typing Skills: Urdu, Arabic, and English</p>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Professional Experience</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-emerald-500">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-600">Current</span>
              </div>
              <h3 className="font-semibold text-gray-800">Freelance Education Consultant</h3>
              <p className="text-blue-600 mb-2">Self-Employed</p>
              <p className="text-xs text-gray-400 mb-2">July 2026 — Present</p>
              <p className="text-gray-600">Developing comprehensive academic plans, curriculums, and educational frameworks for schools including Meezan School, Daniyal Montessori Academy, and other institutions. Designing custom teaching strategies, assessment systems, and learning environments tailored to each school&apos;s vision.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">Head of Department (Secondary)</h3>
              <p className="text-blue-600 mb-2">Private School</p>
              <p className="text-xs text-gray-400 mb-2">2018 — June 2026</p>
              <p className="text-gray-600">Led and managed the secondary department, oversaw curriculum planning, and coordinated teaching methods to align with Cambridge and local education standards.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800">Mathematics Teacher</h3>
              <p className="text-blue-600 mb-2">Government Girls Secondary School</p>
              <p className="text-gray-600">Focused on building students&apos; analytical and problem-solving skills through effective Mathematics teaching and engagement in extracurricular activities.</p>
            </div>
          </div>
        </section>

        {/* Interests Section */}
        <section id="interests" className="container mx-auto mb-32">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Interests</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">Learning New Software and Technology</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">Gardening</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">Travel and Exploration</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-gray-600">Photography</p>
            </div>
          </div>
        </section>

        {/* Spacer for Footer */}
        <div className="pb-4"></div>
      </div>
    </div>
  );
};

export default PortfolioPage;
