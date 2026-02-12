import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AuthGate({ mode, switchMode, continueAsGuest }) {
  const { sendMagicLink } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await sendMagicLink(email);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("✓ Check your email for the login link!");
      setEmail("");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h1>MovieNight</h1>

      {mode === "login" ? (
        <div>
          <h2>Sign In</h2>
          <form onSubmit={handleMagicLink}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <button disabled={loading}>
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}

          <button onClick={continueAsGuest}>
            Continue as Guest
          </button>
        </div>
      ) : (
        <div>
          <h2>Sign Up</h2>
          {/* Add signup form if needed */}
          <button onClick={() => switchMode("login")}>
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}