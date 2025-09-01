import React from 'react';
import { NavLink } from 'react-router-dom'; // Import NavLink

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        {/* Link the brand to the homepage */}
        <NavLink to="/">Rubik's Solver Pro</NavLink>
      </div>
      <div className="nav-links">
        <NavLink to="/" className="nav-link">
          Solve
        </NavLink>
        <NavLink to="/timer" className="nav-link">
          Timer
        </NavLink>
        <NavLink to="/stats">Statistics</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;