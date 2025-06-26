import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import DashboardPage from './pages/DashboardPage';
import SchoolsMap from './components/SchoolsMap'; // ← Import SchoolsMap
import Navbar from './components/Navbar';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/upload" element={<App />} />
      <Route path="/schools-map" element={<SchoolsMap />} /> {/* New route */}
    </Routes>
    {/* Footer (optional) */}
          {/* Footer */}
        <footer className="w-full bg-gray-50 border-t border-gray-200 mt-10 py-6">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-center text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} <span className="font-medium">Denis K</span> — Built with <span className="font-semibold">Java</span> & <span className="font-semibold">React</span>
            </p>
            <p className="mt-2">
              <a
                href="https://www.linkedin.com/in/denisvk-it/" // Replace with actual link
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on LinkedIn
              </a>
            </p>
          </div>
        </footer>

  </BrowserRouter>
  
);
