import React from "react";
import { Building2, Mail, Phone } from "lucide-react";

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
          <div className="flex items-center gap-2 hover:text-yellow-300 transition-colors duration-200">
            <Building2 size={20} />
            <span className="text-sm">Enterprise HR Solutions</span>
          </div>
          <div className="flex items-center gap-2 hover:text-yellow-300 transition-colors duration-200">
            <Mail size={20} />
            <span className="text-sm">support@velocity.com</span>
          </div>
          <div className="flex items-center gap-2 hover:text-yellow-300 transition-colors duration-200">
            <Phone size={20} />
            <span className="text-sm">1-800-VELOCITY</span>
          </div>
        </div>
        <div className="text-lg text-gray-200 font-light text-center md:text-right w-full md:w-auto">
          © {new Date().getFullYear()} VELOCITY. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
