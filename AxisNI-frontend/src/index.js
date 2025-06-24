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
  </BrowserRouter>
);
