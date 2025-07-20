import React from "react";
import { Github, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700 text-white py-10 px-8 shadow-2xl border-t-4 border-indigo-400 fixed left-0 bottom-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4 text-2xl font-extrabold">
          <span className="text-4xl">⚡</span>
          <span className="tracking-wide text-3xl font-black drop-shadow-lg">VELOCITY</span>
          <span className="ml-3 px-3 py-1 rounded bg-white bg-opacity-10 text-base font-bold border border-white border-opacity-20">v1.0</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="https://github.com/SuryaKTiwari11" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors duration-200">
            <Github size={28} />
          </a>
          <a href="https://linkedin.com/in/suryaktiwari11" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors duration-200">
            <Linkedin size={28} />
          </a>
          <a href="https://twitter.com/suryaktiwari11" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors duration-200">
            <Twitter size={28} />
          </a>
        </div>
        <div className="text-lg text-gray-200 font-light text-center md:text-right w-full md:w-auto">
          © {new Date().getFullYear()} VELOCITY. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
