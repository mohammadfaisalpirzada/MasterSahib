'use client';
import React from 'react';
import Image from 'next/image';

const HomePage = () => {
  const getDelayClass = (index: number) => {
    if (index === 1) return 'animation-delay-300';
    if (index === 2) return 'animation-delay-600';
    return 'animation-delay-0';
  };

  const blogPosts = [
    {
      title: "Getting Started with Web Development",
      category: "Programming",
      readTime: "5 min read",
      image: "/images/Mastering.png",
      excerpt: "Begin your journey into web development with this comprehensive guide for beginners."
    },
    {
      title: "Building Your First React App",
      category: "React",
      readTime: "8 min read",
      image: "/images/ReactApp.jpeg",
      excerpt: "Learn how to create your first React application from scratch with this step-by-step tutorial."
    },
    {
      title: "Mastering CSS Grid Layout",
      category: "CSS",
      readTime: "6 min read",
      image: "/images/Mastering.png",
      excerpt: "Deep dive into CSS Grid and learn how to create complex layouts with ease."
    }
  ];

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Learn",
      description: "Access comprehensive tutorials and guides"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: "Connect",
      description: "Join our community of learners"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: "Achieve",
      description: "Earn certificates and build your portfolio"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className='bg-white h-1'>
        <h1> </h1>
      </div>
          {/* Hero Section with Animation */}
      <section className="bg-indigo-600 text-white py-2 animate-fadeIn">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-6 animate-slideUp">
            <h1 className="text-6xl font-bold leading-tight">
              Empower Your Learning Journey 
            </h1>
            <p className="text-xl text-indigo-100 max-w-2xl">
              Discover comprehensive tutorials, build practical projects, and advance your skills with Learnify (Master Sahub).
            </p>
            <div className="pt-4">
              <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition duration-300 flex items-center group">
                Start Learning
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>




      {/* Features Section */}
      <section className="py-16 animate-fadeIn animation-delay-300">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 animate-slideUp ${getDelayClass(index)}`}
              >
                <div className="text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16 bg-white animate-fadeIn animation-delay-600">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Latest Articles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (


             
<article 
  key={post.title}
  className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 animate-slideUp ${getDelayClass(index)}`}
  
>
  
 <Image
  src={post.image}
  //src="/images/profile.jpg" 
  alt={post.title}
  width={800} // Set a width value (e.g., 800px)
  height={400} // Set a height value (e.g., 400px)
  className="w-full h-48 object-cover"
/>

  <div className="p-6">
    
    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
      <span>{post.category}</span>
      <span>{post.readTime}</span>
    </div>
    <h3 className="text-xl font-semibold mb-2 hover:text-indigo-600 transition-colors">
      {post.title}
    </h3>
    <p className="text-gray-600">{post.excerpt}</p>
    <button className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors flex items-center group">
      Read More
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</article>









            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-indigo-600 text-white py-8 animate-fadeIn animation-delay-900">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already advancing their careers with Learnify.
          </p>
          <button className="bg-white text-indigo-600 px-8 py-1 rounded-lg font-semibold hover:bg-indigo-50 transition duration-300">
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

