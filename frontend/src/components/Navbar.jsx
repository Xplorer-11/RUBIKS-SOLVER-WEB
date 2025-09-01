import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  // Get the user object from the context
  const { token, user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/">Rubik's Solver Pro</NavLink>
      </div>
      <div className="nav-links">
        <NavLink to="/" className="nav-link">Solve</NavLink>
        <NavLink to="/timer" className="nav-link">Timer</NavLink>
        <NavLink to="/stats" className="nav-link">Statistics</NavLink>
      </div>
      <div className="nav-auth">
        {token && user ? (
          <>
            {/* Display the username from the decoded token */}
            <span className="welcome-message">Welcome, {user.sub}</span>
            <button onClick={logout} className="auth-button">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="auth-button">Login</NavLink>
            <NavLink to="/register" className="auth-button register-btn">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;