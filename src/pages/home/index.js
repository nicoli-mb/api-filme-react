import React, { useEffect, useState } from "react";
import { Container, Movie, MovieList, SearchContainer, SearchInput, TrailerModal, TrailerOverlay, PlayButton, MovieCard, MoviePoster, MovieInfo, MovieTitle, MovieMeta, MovieDescription, ActionButtons, TrailerButton, DetailsButton, LoadingSpinner, Header, HeaderTitle, HeaderSubtitle } from "./style";
import { Link } from "react-router-dom";

function Home() {
  const imagePath = "https://image.tmdb.org/t/p/w500";
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const KEY = process.env.REACT_APP_KEY;

  console.log("Chave API:", KEY);

  // Função para buscar trailer do filme
  const fetchTrailer = async (movieId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${KEY}&language=pt-BR`
      );
      const data = await response.json();
      
      // Procura por trailer oficial
      const trailer = data.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      ) || data.results[0]; // Pega o primeiro se não encontrar trailer
      
      if (trailer) {
        setSelectedTrailer(trailer);
      } else {
        alert("Trailer não encontrado para este filme");
      }
    } catch (error) {
      console.error("Erro ao buscar trailer:", error);
      alert("Erro ao carregar trailer");
    } finally {
      setLoading(false);
    }
  };

  const closeTrailer = () => {
    setSelectedTrailer(null);
  };

  const openMovieDetails = (movie) => {
    setSelectedMovie(movie);
  };

  const closeMovieDetails = () => {
    setSelectedMovie(null);
  };

  useEffect(() => {
    let url;
    if (searchTerm.trim() === "") {
      url = `https://api.themoviedb.org/3/movie/popular?api_key=${KEY}&language=pt-BR`;
    } else {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&language=pt-BR&query=${encodeURIComponent(searchTerm)}`;
    }
    console.log("URL requisitada:", url);

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log("Dados recebidos:", data);
        setMovies(data.results || []);
      })
      .catch((error) => console.error("Erro no fetch:", error));
  }, [KEY, searchTerm]);

  return (
    <Container>
      <Header>
        <HeaderTitle>
          Cine<span>Flux</span>
        </HeaderTitle>
        <HeaderSubtitle>
          Descubra os melhores filmes com trailers em alta qualidade
        </HeaderSubtitle>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="🔍 Pesquisar filmes..."
          value={searchTerm}
          onChange={(e) => {
            console.log("Buscando:", e.target.value);
            setSearchTerm(e.target.value);
          }}
        />
      </SearchContainer>

      <MovieList>
        {movies.map((movie) => (
          <Movie key={movie.id}>
            <MovieCard>
              <MoviePoster>
                <img
                  src={`${imagePath}${movie.poster_path}`}
                  alt={movie.title}
                />
                <PlayButton
                  onClick={() => fetchTrailer(movie.id)}
                  disabled={loading}
                >
                  ▶
                </PlayButton>
              </MoviePoster>

              <MovieInfo>
                <MovieTitle>{movie.title}</MovieTitle>
                
                <MovieMeta>
                  <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                  <span>📅 {new Date(movie.release_date).getFullYear()}</span>
                </MovieMeta>

                <MovieDescription>
                  {movie.overview?.substring(0, 120)}...
                </MovieDescription>

                <ActionButtons>
                  <TrailerButton
                    onClick={() => fetchTrailer(movie.id)}
                    disabled={loading}
                  >
                    ▶ Trailer
                  </TrailerButton>
                  
                  <DetailsButton onClick={() => openMovieDetails(movie)}>
                    👁 Detalhes
                  </DetailsButton>
                </ActionButtons>
              </MovieInfo>
            </MovieCard>
          </Movie>
        ))}
      </MovieList>

      {/* Modal do Trailer */}
      {selectedTrailer && (
        <TrailerModal onClick={closeTrailer}>
          <TrailerOverlay onClick={(e) => e.stopPropagation()}>
            <div className="trailer-header">
              <h2>{selectedTrailer.name}</h2>
              <button onClick={closeTrailer}>×</button>
            </div>
            
            <div className="trailer-video">
              <iframe
                src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1`}
                title={selectedTrailer.name}
                allowFullScreen
                allow="autoplay"
              ></iframe>
            </div>
            
            <div className="trailer-footer">
              <button onClick={closeTrailer}>Fechar</button>
            </div>
          </TrailerOverlay>
        </TrailerModal>
      )}

      {/* Modal de Detalhes do Filme */}
      {selectedMovie && (
        <TrailerModal onClick={closeMovieDetails}>
          <TrailerOverlay onClick={(e) => e.stopPropagation()}>
            <div className="movie-details">
              <div className="movie-details-header">
                <h2>{selectedMovie.title}</h2>
                <button onClick={closeMovieDetails}>×</button>
              </div>
              
              <div className="movie-details-content">
                <div className="movie-details-poster">
                  <img
                    src={`${imagePath}${selectedMovie.poster_path}`}
                    alt={selectedMovie.title}
                  />
                </div>
                
                <div className="movie-details-info">
                  <div className="movie-stats">
                    <span className="rating">⭐ {selectedMovie.vote_average?.toFixed(1)}/10</span>
                    <span className="release-date">📅 {new Date(selectedMovie.release_date).toLocaleDateString('pt-BR')}</span>
                    <span className="popularity">🔥 {Math.round(selectedMovie.popularity)} views</span>
                  </div>
                  
                  <div className="movie-overview">
                    <h3>Sinopse</h3>
                    <p>{selectedMovie.overview || "Sinopse não disponível para este filme."}</p>
                  </div>
                  
                  <div className="movie-actions">
                    <button 
                      className="action-btn trailer-btn"
                      onClick={() => {
                        closeMovieDetails();
                        fetchTrailer(selectedMovie.id);
                      }}
                    >
                      ▶ Assistir Trailer
                    </button>
                    <button 
                      className="action-btn close-btn"
                      onClick={closeMovieDetails}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TrailerOverlay>
        </TrailerModal>
      )}

      {/* Loading */}
      {loading && (
        <LoadingSpinner>
          <div className="spinner"></div>
          <span>Carregando trailer...</span>
        </LoadingSpinner>
      )}
    </Container>
  );
}

export default Home;