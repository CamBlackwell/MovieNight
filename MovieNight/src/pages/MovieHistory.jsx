const API_KEY = "be92c0af";

import { useState } from "react";
import "./MovieHistory.css";

export default function MovieHistory() {
  const [searchText, setSearchText] = useState("");
  const [movieData, setMovieData] = useState(null);
  const [chosenBy, setChosenBy] = useState("");
  const [savedMovies, setSavedMovies] = useState([]);

  async function lookupMovie() {
    if (!searchText.trim()) return;

    const response = await fetch(
      `https://www.omdbapi.com/?t=${encodeURIComponent(searchText)}&apikey=${API_KEY}`
    );

    const data = await response.json();

    if (data.Response === "False") {
      alert("Movie not found!");
      return;
    }

    setMovieData(data);
  }

  function saveMovie() {
    if (!movieData || !chosenBy.trim()) return;

    const newEntry = {
      id: Date.now(),
      title: movieData.Title,
      year: movieData.Year,
      plot: movieData.Plot,
      poster: movieData.Poster,
      chosenBy: chosenBy.trim()
    };

    setSavedMovies([...savedMovies, newEntry]);

    setSearchText("");
    setMovieData(null);
    setChosenBy("");
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
        />
        <button className="movieAdd-button" onClick={lookupMovie}>
          Lookup
        </button>
      </div>

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
              <p>
                <strong>Chosen By:</strong> {movie.chosenBy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
