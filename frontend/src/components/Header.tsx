import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="header">
      <Link to="/" className="logo">
        BlackJack Me
      </Link>
      <nav className="nav">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/rules" className="nav-link">
          Rules
        </Link>
        <Link to="/leaderboard" className="nav-link">
          Leaderboard
        </Link>
      </nav>
      <button className="login-button">Login</button>
    </header>
  );
};

export default Header;
