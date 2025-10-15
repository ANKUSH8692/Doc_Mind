import React from 'react';
import { Link } from 'react-router-dom';

import Card from './cards.jsx'
import Books from './Books.jsx';

const Home = () => {
  const techStackMap = new Map([
    ['React', 'Frontend library for building interactive user interfaces with component-based architecture'],
    ['Tailwind', 'Utility-first CSS framework for rapid UI development with responsive design'],
    ['Python', 'Backend language powering the RAG pipeline with Flask API and data processing'],
    ['LLM', 'Large Language Model (Groq/Llama) for intelligent query answering and summarization'],
    ['RAG', 'Retrieval Augmented Generation system combining vector search with LLM responses'],
    ['Express', 'Node.js framework handling API routes and middleware for the application'],
    ['MongoDB', 'NoSQL database storing user data, sessions, and application metadata']
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <img class="rounded-full w-24 h-24 object:cover" src="doc_mind.png" />
          <span className="ml-3 text-xl font-bold text-gray-800">Doc's Mind</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-gray-600 hover:text-indigo-600">Login</Link>
          <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Unlock Precise Answers from Your Library
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Go beyond simple search. Our RAG-powered AI intelligently extracts and synthesizes information from books,
          delivering direct answers to your queries and facilitating comprehensive knowledge discovery.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {Array.from(techStackMap).map(([key, value]) => (
            <Card key={key} title={key} description={value} />
          ))}
        </div>

        <div className="space-x-4 flex justify-center">
          <div className=''>
            <Books />
          </div>






          <a
            href="https://github.com/ANKUSH8692"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center gap-3 items-center mx-auto shadow-xl text-lg bg-white border-2 border-gray-300 text-gray-800 font-medium px-6 py-3 rounded-full hover:bg-black hover:text-white hover:border-emerald-500 transition-all duration-300 group"
          >
            GitHub Repo
            <svg
              className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90 group-hover:text-white"
              fill="currentColor"
              viewBox="0 0 16 19"
            >
              <path
                d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
              />
            </svg>
          </a>

        </div>
      </main>
    </div>
  );
};

export default Home;