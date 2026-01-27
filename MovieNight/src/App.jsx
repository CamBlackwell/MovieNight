import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Message from "./pages/Messages";
import MovieHistory from "./pages/MovieHistory";
import Settings from "./pages/settings";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="nav-bar">
          <div className="nav-left">
            <Link to="/" className="nav-link nav-box">Home</Link>
          </div>

          <div className="nav-center">
            <Link to="/messages" className="nav-link nav-box">Messages</Link>
          </div>

          <div className="nav-right">
            <Link to="/history" className="nav-link nav-box">History</Link>
          </div>
        </nav>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/messages" element={<Message />} />
            <Route path="/history" element={<MovieHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
