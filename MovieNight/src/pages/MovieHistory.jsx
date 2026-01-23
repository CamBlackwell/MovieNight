const API_KEY = "be92c0af";

import { useState, useEffect } from "react";
import "./MovieHistory.css";
import { supabase } from "../supabaseClient.js";

export default function MovieHistory() {
  const [searchResults, setSearchResults] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [movieData, setMovieData] = useState(null);
  const [chosenBy, setChosenBy] = useState("");
  const [savedMovies, setSavedMovies] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [editingMovieId, setEditingMovieId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedChosenBy, setEditedChosenBy] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [editedPlot, setEditedPlot] = useState("");

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

  async function saveMovie() {
    if (!movieData || !chosenBy.trim() || !selectedDate) return;

    const newEntry = {
      title: movieData.Title,
      year: movieData.Year,
      plot: movieData.Plot,
      poster: movieData.Poster,
      chosen_by: chosenBy.trim(),
      watched_date: selectedDate,
    };

    const { data, error } = await supabase
      .from("movies")
      .insert(newEntry)
      .select();

    if (error) {
      console.error("supabase insert error:", error);
      alert("Failed to save movie entry.");
      return;
    }

    const inserted = data[0];

    setSavedMovies(prev =>
      [...prev, inserted].sort(
        (a, b) => new Date(b.watched_date) - new Date(a.watched_date)
      )
    );

    setSearchResults([]);
    setSearchText("");
    setMovieData(null);
    setChosenBy("");
    setSelectedDate("");
  }

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    const { data, error } = await supabase
      .from("movies")
      .select("*")
      .order("watched_date", { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return;
    }

    setSavedMovies(data);
  }

  async function deleteMovie(id) {
    const { error } = await supabase
      .from("movies")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      return;
    }

    setSavedMovies(prev => prev.filter(movie => movie.id !== id));
  }

  function startEditing(movie) {
    setEditingMovieId(movie.id);
    setEditedTitle(movie.title);
    setEditedPlot(movie.plot);
    setEditedChosenBy(movie.chosen_by);
    setEditedDate(movie.watched_date);
  }

  async function saveEdit(id) {
    const { data, error } = await supabase
      .from("movies")
      .update({
        title: editedTitle,
        plot: editedPlot,
        chosen_by: editedChosenBy,
        watched_date: editedDate
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return;
    }

    const updated = data[0];

    setSavedMovies(prev =>
      prev
        .map(movie => (movie.id === id ? updated : movie))
        .sort((a, b) => new Date(b.watched_date) - new Date(a.watched_date))
    );

    setEditingMovieId(null);
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

              {editingMovieId === movie.id ? (
                <div className="movieAdd-editForm">

                  <input
                    className="movieAdd-input"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                  />

                  <textarea
                    className="movieAdd-input"
                    value={editedPlot}
                    onChange={(e) => setEditedPlot(e.target.value)}
                  />

                  <input
                    className="movieAdd-input"
                    value={editedChosenBy}
                    onChange={(e) => setEditedChosenBy(e.target.value)}
                  />

                  <input
                    type="date"
                    className="movieAdd-input"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                  />

                  <button
                    className="movieAdd-saveButton"
                    onClick={() => saveEdit(movie.id)}
                  >
                    Save
                  </button>

                  <button
                    className="movieAdd-deleteButton"
                    onClick={() => setEditingMovieId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3>{movie.title}</h3>
                  <p>{movie.plot}</p>
                  <p><strong>Chosen By:</strong> {movie.chosen_by}</p>
                  <p><strong>Watched:</strong> {movie.watched_date}</p>

                  <button
                    className="movieAdd-editButton"
                    onClick={() => startEditing(movie)}
                  >
                    Edit
                  </button>

                  <button
                    className="movieAdd-deleteButton"
                    onClick={() => deleteMovie(movie.id)}
                  >
                    Delete
                  </button>
                </>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
