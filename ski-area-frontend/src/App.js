import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Components/HomePage';
import RoutesPage from './Components/RoutesPage';
import Login from './Components/Login';
import Signup from './Components/Signup';
import './App.css';

function App() {
  return (
    <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/routes" element={<RoutesPage />} />
          </Routes>
        </div>
    </BrowserRouter>
  );
}

export default App;
