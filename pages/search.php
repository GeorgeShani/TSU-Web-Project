<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="../images/icon.svg">
    <link rel="stylesheet" href="../styles/style.css">
    <title>Search | EchoWave | Music Player</title>
  </head>
  <body>
    <?php require_once '../components/header.php'; ?>
    <main class="search-page">
      <div class="search-page__container">
        <header class="search-header">
          <h1 class="search-header__title">Search Music</h1>
          <p class="search-header__subtitle">Discover your next favorite song, artist, or album</p>
        </header>
        <section class="search-input-wrapper">
          <fieldset class="search-input">
            <legend>Search for songs, artists or albums</legend>
            <div class="search-input__icon">
              <?php require_once '../components/search-icon.php'; ?>
            </div>
            <input 
              type="text" 
              class="search-input__field" 
              placeholder="Search for songs, artists, or albums..." 
              id="searchInput" 
            />
            <div class="search-input__actions">
              <button class="search-input__clear hidden" id="clearButton">
                <?php require_once '../components/clear-icon.php'; ?>
              </button>
            </div>
          </fieldset>
        </section>
        <section class="search-content">
          <div class="empty-state hidden" id="emptyState">
            <div class="empty-state__container">
              <div class="empty-state__icon">
                <img src="../images/search-x.svg" alt="Search X Icon" width="48" height="48" />
              </div>
              <h2 class="empty-state__title">No results found for "<span id="emptyStateQuery"></span>"</h2>
              <p class="empty-state__subtitle">Don't worry, let's try something else</p>
              <div class="empty-state__suggestions">
                <h3 class="empty-state__suggestions-title">Suggestions:</h3>
                <ul class="empty-state__suggestions-list">
                  <li>Try different keywords</li>
                  <li>Check your spelling</li>
                  <li>Use fewer words</li>
                  <li>Search for artist names or song titles</li>
                </ul>
              </div>
              <div class="empty-state__trending">
                <div class="empty-state__trending-header">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  <h3>Trending Searches</h3>
                </div>
                <div class="empty-state__trending-tags">
                  <button class="trending-tag">Taylor Swift</button>
                  <button class="trending-tag">Bad Bunny</button>
                  <button class="trending-tag">The Weeknd</button>
                  <button class="trending-tag">Billie Eilish</button>
                  <button class="trending-tag">Drake</button>
                </div>
              </div>
            </div>
          </div>
          <div class="search-results hidden" id="searchResults">
            <div class="result-section hidden" id="tracksSection">
              <div class="result-section__header">
                <h2 class="result-section__title">Songs</h2>
                <button class="result-section__toggle hidden" id="tracksToggle">
                  <span class="result-section__toggle-text">Show all</span>
                  <svg class="result-section__toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              <div class="tracks-list" id="tracksList"></div>
            </div>
            <div class="result-section hidden" id="artistsSection">
              <div class="result-section__header">
                <h2 class="result-section__title">Artists</h2>
                <button class="result-section__toggle hidden" id="artistsToggle">
                  <span class="result-section__toggle-text">Show all</span>
                  <svg class="result-section__toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              <div class="artists-grid" id="artistsGrid"></div>
            </div>
            <div class="result-section hidden" id="albumsSection">
              <div class="result-section__header">
                <h2 class="result-section__title">Albums</h2>
                <button class="result-section__toggle hidden" id="albumsToggle">
                  <span class="result-section__toggle-text">Show all</span>
                  <svg class="result-section__toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              <div class="albums-grid" id="albumsGrid"></div>
            </div>
            <div class="result-section hidden" id="playlistsSection">
              <div class="result-section__header">
                <h2 class="result-section__title">Playlists</h2>
                <button class="result-section__toggle hidden" id="playlistsToggle">
                  <span class="result-section__toggle-text">Show all</span>
                  <svg class="result-section__toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
              <div class="playlists-grid" id="playlistsGrid"></div>
            </div>
          </div>
          <div class="search-skeleton hidden" id="searchSkeleton">
            <div class="skeleton-section">
              <div class="skeleton-header"></div>
              <div class="skeleton-items">
                <div class="skeleton-item" data-repeat="5">
                  <div class="skeleton-image"></div>
                  <div class="skeleton-content">
                    <div class="skeleton-line skeleton-line--title"></div>
                    <div class="skeleton-line skeleton-line--subtitle"></div>
                  </div>
                  <div class="skeleton-line skeleton-line--duration"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
    <script src="../scripts/search.js"></script>
    <script src="../scripts/index.js"></script>
  </body>
</html>