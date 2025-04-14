import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleGoogle,
  handleSignIn,
  handlePasswordReset,
} from "../firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await handleSignIn(email, password);
      navigate("/game");
    } catch (error) {
      console.log(error);
      setError("Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await handleGoogle();
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setError("Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!email) {
        setError("Please enter your email first");
        return;
      }
      await handlePasswordReset(email);
      setError("Password reset email sent!");
    } catch (error) {
      console.log(error);
      setError("Failed to reset password");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome to BlackJack</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>

        <div className="divider">or</div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="google-btn"
        >
          Sign in with Google
        </button>

        <div className="auth-links">
          <button
            onClick={handleResetPassword}
            className="reset-btn"
            disabled={loading}
          >
            Forgot Password?
          </button>
          <a href="/signup" className="signup-link">
            Need an account? Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
