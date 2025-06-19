import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';                // Your upload + chart creation page
import DashboardPage from './pages/DashboardPage'; // The static dashboard page

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/upload" element={<App />} />
    </Routes>
  </BrowserRouter>
);
