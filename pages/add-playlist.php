<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="../images/icon.svg">
    <link rel="stylesheet" href="../styles/style.css">
    <title>Create Playlist | EchoWave | Music Player</title>
  </head>
  <body>
    <?php require_once '../components/header.php'; ?>
    <main class="main-content">
      <div class="add-playlist__container">
        <header class="add-playlist__header">
          <h1 class="add-playlist__title">Create New Playlist</h1>
          <p class="add-playlist__subtitle">Build your perfect music collection</p>
        </header>
        <section class="add-playlist__content">
          <div class="add-playlist__content-inner">
            <h2 class="add-playlist__content-title">
              <img src="../images/list-music.svg" alt="Music List Icon" width="36" height="36" />
              Create Playlist
            </h2>
            <form class="add-playlist__form" id="playlistForm" enctype="multipart/form-data" method="post" action="../includes/add-playlist.php">
              <div class="add-playlist__grid">
                <div class="add-playlist__left">
                  <div class="add-playlist__form-section">
                    <fieldset>
                      <legend>Playlist Details</legend>
                      <div class="add-playlist__image-upload">
                        <label class="add-playlist__image-label">Playlist Cover</label>
                        <div class="add-playlist__image-container">
                          <div class="add-playlist__image-preview" id="imagePreview" style="display: none;">
                            <img class="add-playlist__image" id="previewImage" alt="Playlist cover preview">
                            <button type="button" class="add-playlist__image-remove" id="removeImage">
                              <img src="../images/remove.svg" alt="Remove Image" width="16" height="16">
                            </button>
                          </div>
                          <div class="add-playlist__image-dropzone" id="imageDropzone">
                            <div class="add-playlist__dropzone-icon">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                              </svg>
                            </div>
                            <span class="add-playlist__dropzone-text">Upload Cover Image</span>
                            <span class="add-playlist__dropzone-subtext">JPG, PNG, WEBP up to 10MB</span>
                          </div>
                        </div>
                        <input 
                          type="file" 
                          id="imageInput" 
                          name="playlist_cover"
                          class="add-playlist__image-input" 
                          accept=".jpg,.jpeg,.png,.webp"
                        />
                      </div>
                      <div class="add-playlist__field">
                        <label class="add-playlist__field-label" for="playlistName">Playlist Name*</label>
                        <input 
                          type="text" 
                          id="playlistName" 
                          name="playlist_name"
                          class="add-playlist__field-input"
                          placeholder="Enter playlist name" 
                          maxlength="100"
                          required
                        />
                      </div>
                    </fieldset>
                  </div>
                  <aside class="add-playlist__summary" id="playlistSummary" style="display: none;">
                    <h3 class="add-playlist__summary-title">
                      <img src="../images/music-purple.svg" alt="Playlist Icon" width="24" height="24" />
                      Playlist Summary
                    </h3>
                    <div class="add-playlist__summary-stats">
                      <div class="add-playlist__summary-stat">
                        <span>Total Tracks:</span>
                        <span class="add-playlist__summary-value" id="trackCount">0</span>
                      </div>
                    </div>
                  </aside>
                </div>
                <section class="add-playlist__right">
                  <div class="add-playlist__search">
                    <h2 class="add-playlist__search-title">
                      <img src="../images/search-purple.svg" alt="Search Icon" width="24" height="24" />
                      Add Tracks
                    </h2>
                    <div class="add-playlist__search-bar">
                      <input 
                        type="text" 
                        id="searchInput" 
                        name="searchTracks"
                        class="add-playlist__search-input add-playlist__search-input--with-search-icon"
                        placeholder="Search for tracks by title or artist..."
                      />
                      <div class="add-playlist__search-spinner" id="searchSpinner" style="display: none;">
                        <div class="add-playlist__spinner"></div>
                      </div>
                    </div>
                    <div class="add-playlist__search-results" id="searchResults">
                      <div class="add-playlist__search-empty">
                        <img src="../images/search-silver.svg" alt="Search Icon" width="64" height="64" />
                        <p class="add-playlist__search-empty-title">Start typing to search for tracks</p>
                        <p class="add-playlist__search-empty-subtitle">Discover amazing music to add to your playlist</p>
                      </div>
                    </div>
                  </div>
                  <div class="add-playlist__tracks">
                    <div class="add-playlist__tracks-header">
                      <h2 class="add-playlist__tracks-title">
                        <img src="../images/music-purple.svg" alt="Music Icon" width="24" height="24" />
                        Selected Tracks
                      </h2>
                      <div class="add-playlist__tracks-counter" id="tracksCounter" style="display: none;">
                        <span class="add-playlist__tracks-counter-text"><span id="selectedCount">0</span>/100 tracks</span>
                        <div class="add-playlist__tracks-counter-bar">
                          <div class="add-playlist__tracks-counter-progress" id="tracksProgress"></div>
                        </div>
                      </div>
                    </div>
                    <div class="add-playlist__tracks-list" id="tracksList">
                      <div class="add-playlist__tracks-empty">
                        <img src="../images/music-silver.svg" alt="Music Icon" width="64" height="64" />
                        <p class="add-playlist__tracks-empty-title">No tracks selected</p>
                        <p class="add-playlist__tracks-empty-subtitle">Search and add tracks to build your playlist</p>
                      </div>
                    </div>
                  </div>
                  <input type="hidden" id="selectedTracks" name="selected_tracks" value="[]" />
                </section>
              </div>
              <div class="add-playlist__submit">
                <button type="submit" id="submitButton" class="add-playlist__submit-button" disabled>
                  <div class="add-playlist__submit-content">
                    <img src="../images/upload.svg" alt="Upload Icon" width="24" height="24" />
                    <span class="add-playlist__submit-text">Create Playlist</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
    <script src="../scripts/add-playlist.js"></script>
    <script src="../scripts/index.js"></script>
  </body>
</html>