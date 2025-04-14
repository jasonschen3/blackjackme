import { useNavigate } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const handlePlay = () => {
    navigate("/game");
  };

  return (
    <div className="home-container">
      <Header />
      <h1 className="title">BlackJack Me</h1>

      <div className="card">
        <p className="description">Welcome</p>

        <button className="start-button" onClick={handlePlay}>
          Play Now
        </button>

        <div className="token-info">
          1 Token = 1¢ | Minimum Buy-in: 100 Tokens ($1)
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
