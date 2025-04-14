import { Link, useNavigate } from "react-router-dom";
import { handleSignOut } from "../firebase/auth";

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };
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
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
      <button className="sign-out" onClick={handleSignOut}>
        Signout
      </button>
    </header>
  );
};

export default Header;
