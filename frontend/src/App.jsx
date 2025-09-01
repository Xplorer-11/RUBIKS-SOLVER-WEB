import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SolverPage from './components/SolverPage';
import TimerPage from './components/TimerPage';
import StatisticsPage from './components/StatisticsPage';
import LoginPage from './components/LoginPage'; // Import
import RegisterPage from './components/RegisterPage'; // Import
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<SolverPage />} />
          <Route path="/timer" element={<TimerPage />} />
          <Route path="/stats" element={<StatisticsPage />} />
          <Route path="/login" element={<LoginPage />} />       {/* Add Route */}
          <Route path="/register" element={<RegisterPage />} /> {/* Add Route */}
        </Routes>
      </main>
    </div>
  );
}

export default App;