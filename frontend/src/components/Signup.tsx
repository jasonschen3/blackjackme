import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  handleGoogle,
  handleCreateUser,
  handleEmailVerification,
} from "../firebase/auth";
import axios from "axios";
import { BACKEND_IP } from "../constants";
import { auth } from "../firebase/firebaseConfig"; // Make sure to import this!

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setLoading(true);

      await handleCreateUser(email, password);

      await handleEmailVerification();
      setSuccessMessage("Verification email sent! Please check your inbox.");
      setVerificationSent(true);
    } catch (error) {
      console.error("Error creating account:", error);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    try {
      setError("");
      setLoading(true);

      const user = auth.currentUser;
      if (!user) {
        setError("No user logged in. Please sign up again.");
        return;
      }

      await user.reload(); // Refresh user from Firebase

      if (user.emailVerified) {
        await axios.post(`${BACKEND_IP}/create-user`, {
          uid: user.uid,
          username,
          email,
        });

        setSuccessMessage("Account created successfully! You can now log in.");
        navigate("/login");
      } else {
        setError("Email not verified yet. Please check your inbox.");
      }
    } catch (error) {
      console.error("Error checking verification:", error);
      setError("Failed to verify email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError("");
      setLoading(true);

      const userCred = await handleGoogle();

      // Check if user is new and send to backend
      await axios.post(`${BACKEND_IP}/create-user`, {
        uid: userCred.user.uid,
        username: userCred.user.displayName || "GoogleUser",
        email: userCred.user.email,
      });

      navigate("/login");
    } catch (error) {
      console.error("Google signup error:", error);
      setError("Failed to sign up with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Your Account</h2>

        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        {!verificationSent ? (
          <form onSubmit={handleEmailSignup}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

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
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up with Email"}
            </button>
          </form>
        ) : (
          <div>
            <p>
              Please verify your email address. Once verified, click below to
              finish registration (important to finish registration).
            </p>
            <button onClick={handleCheckVerification} disabled={loading}>
              {loading ? "Checking Verification..." : "Check Verification"}
            </button>
          </div>
        )}

        <div className="divider">or</div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="google-btn"
        >
          Sign Up with Google
        </button>

        <div className="auth-links">
          <a href="/login" className="login-link">
            Already have an account? Log In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
