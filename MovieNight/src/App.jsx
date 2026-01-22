import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Message from "./pages/Messages";
import WeeklyAlert from "./pages/WeeklyAlert";
import MovieHistory from "./pages/MovieHistory";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-900 text-white">

        {/* NAVIGATION */}
        <nav className="w-full bg-white text-black shadow px-6 py-4 flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg">Home</Link>
          <Link to="/messages" className="hover:underline">Messages</Link>
          <Link to="/alert" className="hover:underline">Weekly Alert</Link>
          <Link to="/history" className="hover:underline">History</Link>
        </nav>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">
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
