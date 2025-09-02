import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#161B22]/60 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
          Gemini Image Studio
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Create and edit images with the power of AI
        </p>
      </div>
    </header>
  );
};