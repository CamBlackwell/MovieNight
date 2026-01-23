import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Message from "./pages/Messages";
import WeeklyAlert from "./pages/WeeklyAlert";
import MovieHistory from "./pages/MovieHistory";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="nav-bar">
          <Link to="/" className="nav-link nav-home">Home</Link>
          <Link to="/messages" className="nav-link">Messages</Link>
          <Link to="/alert" className="nav-link">Weekly Alert</Link>
          <Link to="/history" className="nav-link">History</Link>
        </nav>

        <main className="page-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/messages" element={<Message />} />
            <Route path="/alert" element={<WeeklyAlert />} />
            <Route path="/history" element={<MovieHistory />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
