import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import AuthGate from "./pages/AuthGate";

import "./App.css";

import Home from "./pages/Home";
import MovieHistory from "./pages/MovieHistory";
import Settings from "./pages/settings";
import NotFound from "./pages/NotFound";

export default function App() {
  const { activeUser, loading, createGuest, logout } = useContext(AuthContext);
  const [authMode, setAuthMode] = useState("login");

  console.log("App render:", { activeUser, loading });

  if (loading) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <p>Loading...</p>
    </div>
  );
}

  if (!activeUser)
    return (
      <AuthGate
        mode={authMode}
        switchMode={setAuthMode}
        continueAsGuest={() => createGuest("Guest")}
      />
    );

  return (
    <Router>
      <div className="app-container">
        <nav className="nav-bar">
          <div className="nav-left">
            <Link to="/" className="nav-link nav-box">Home</Link>
          </div>

          <div className="nav-right">
            <Link to="/history" className="nav-link nav-box">History</Link>
            <Link to="/settings" className="nav-link nav-box">Settings</Link>

            <button className="logout-box" onClick={logout}>Logout</button>
          </div>
        </nav>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<MovieHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
