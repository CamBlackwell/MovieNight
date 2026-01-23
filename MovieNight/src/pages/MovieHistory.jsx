const API_KEY = "be92c0af";

import { useState } from "react";
import "./MovieHistory.css";

export default function MovieHistory() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [movieData, setMovieData] = useState(null);
  const [chosenBy, setChosenBy] = useState("");
  const [savedMovies, setSavedMovies] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  async function lookupMovie() {
    if (!searchText.trim()) return;

    const response = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(searchText)}&apikey=${API_KEY}`
    );

    const data = await response.json();

    if (data.Response === "False") {
      setSearchResults([]);
      alert("Movie not found!");
      return;
    }

    setSearchResults(data.Search);
  }

  async function selectMovie(imdbID) {
    const response = await fetch(
      `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`
    );
    
    const data = await response.json();
    setMovieData(data);
    setSearchResults([]);
    setSearchText(data.Title);
  }

  function saveMovie() {
    if (!movieData || !chosenBy.trim() || !selectedDate) return;

    const newEntry = {
      id: Date.now(),
      title: movieData.Title,
      year: movieData.Year,
      plot: movieData.Plot,
      poster: movieData.Poster,
      chosenBy: chosenBy.trim(),
      watchedDate: selectedDate
    };

    setSavedMovies(prev => [...prev, newEntry].sort((a, b) => new Date(b.watchedDate) - new Date(a.watchedDate)));

    setSearchResults([]);
    setSearchText("");
    setMovieData(null);
    setChosenBy("");
    setSelectedDate("");
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") lookupMovie();
  }

  return (
    <div className="movieAdd-container">
      <h1 className="movieAdd-header">Add Watched Movie</h1>

      <div className="movieAdd-searchRow">
        <input
          className="movieAdd-input"
          placeholder="Search movie title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button className="movieAdd-button" onClick={lookupMovie}>
          Lookup
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="movieAdd-searchResults">
          {searchResults.map((m) => (
            <div
              key={m.imdbID}
              className="movieAdd-searchItem"
              onClick={() => selectMovie(m.imdbID)}
            >
              {m.Title} ({m.Year})
            </div>
          ))}
        </div>
      )}


      {movieData && (
        <div className="movieAdd-details">
          {movieData.Poster && movieData.Poster !== "N/A" && (
            <img
              src={movieData.Poster}
              alt="Poster"
              className="movieAdd-poster"
            />
          )}

          <div className="movieAdd-info">
            <h2>{movieData.Title}</h2>
            <p>{movieData.Plot}</p>

            <input
              className="movieAdd-input"
              placeholder="Chosen by..."
              value={chosenBy}
              onChange={(e) => setChosenBy(e.target.value)}
            />

            <input
              className="movieAdd-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />

            <button className="movieAdd-saveButton" onClick={saveMovie}>
              Save Entry
            </button>
          </div>
        </div>
      )}

      <h2 className="movieAdd-subheader">Saved Movies</h2>
      <div className="movieAdd-list">
        {savedMovies.map((movie) => (
          <div key={movie.id} className="movieAdd-entry">
            <img
              src={movie.poster}
              alt=""
              className="movieAdd-entryPoster"
            />
            <div className="movieAdd-entryText">
              <h3>{movie.title}</h3>
              <p>{movie.plot}</p>
              <p><strong>Chosen By:</strong> {movie.chosenBy}</p>
              <p><strong>Watched:</strong> {movie.watchedDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
