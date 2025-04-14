import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_IP } from "../constants";
import { auth } from "../firebase/firebaseConfig";

const Dashboard = () => {
  const [tokens, setTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch tokens when the component loads
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not logged in");

        const idToken = await currentUser.getIdToken();
        const response = await axios.get(`${BACKEND_IP}/tokens`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        setTokens(response.data.tokens);
      } catch (err) {
        console.error("Error fetching tokens:", err);
        setError("Failed to fetch tokens. Please try again.");
      }
    };

    fetchTokens();
  }, []);

  // Handle buying tokens
  const handleBuyTokens = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not logged in");

      const idToken = await currentUser.getIdToken();
      const response = await axios.post(
        `${BACKEND_IP}/buy100`,
        {},
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (err) {
      console.error("Error buying tokens:", err);
      setError("Failed to initiate token purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle cashing out tokens
  const handleCashOut = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not logged in");

      const idToken = await currentUser.getIdToken();
      await axios.post(
        `${BACKEND_IP}/cashout`,
        { tokens },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      setTokens(0); // Reset tokens after cashing out
      setSuccessMessage("Successfully cashed out your tokens!");
    } catch (err) {
      console.error("Error cashing out tokens:", err);
      setError("Failed to cash out tokens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="token-display">
        <h2>Your Tokens: {tokens}</h2>
      </div>

      <div className="dashboard-actions">
        <button onClick={handleBuyTokens} disabled={loading}>
          {loading ? "Processing..." : "Get More Tokens"}
        </button>
        <button onClick={handleCashOut} disabled={loading || tokens === 0}>
          {loading ? "Processing..." : "Cash Out"}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
