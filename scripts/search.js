// Global variables
let searchTimeout = null;
let isLoading = false;
let expandedSections = {
  tracks: false,
  artists: false,
  albums: false,
  playlists: false,
};

// DOM elements
let searchInput, clearButton;
let searchResults, emptyState, searchSkeleton, emptyStateQuery;
let tracksSection, artistsSection, albumsSection, playlistsSection;
let tracksList, artistsGrid, albumsGrid, playlistsGrid;
let tracksToggle, artistsToggle, albumsToggle, playlistsToggle;

let searchData = {};

fetch("../includes/get_search_data.php")
  .then((res) => res.json())
  .then((data) => {
    searchData = data;
    console.log(data);
  });

// Initialize DOM elements
function initializeElements() {
  searchInput = document.getElementById("searchInput");
  clearButton = document.getElementById("clearButton");
  searchResults = document.getElementById("searchResults");
  emptyState = document.getElementById("emptyState");
  searchSkeleton = document.getElementById("searchSkeleton");
  emptyStateQuery = document.getElementById("emptyStateQuery");

  // Result sections
  tracksSection = document.getElementById("tracksSection");
  artistsSection = document.getElementById("artistsSection");
  albumsSection = document.getElementById("albumsSection");
  playlistsSection = document.getElementById("playlistsSection");

  // Result containers
  tracksList = document.getElementById("tracksList");
  artistsGrid = document.getElementById("artistsGrid");
  albumsGrid = document.getElementById("albumsGrid");
  playlistsGrid = document.getElementById("playlistsGrid");

  // Toggle buttons
  tracksToggle = document.getElementById("tracksToggle");
  artistsToggle = document.getElementById("artistsToggle");
  albumsToggle = document.getElementById("albumsToggle");
  playlistsToggle = document.getElementById("playlistsToggle");
}

// Event handlers
function handleSearchInput(value) {
  // Show/hide clear button
  if (value.trim() !== "") {
    clearButton.classList.remove("hidden");
  } else {
    clearButton.classList.add("hidden");
  }

  // Debounce search
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    performSearch(value);
  }, 300);
}

function handleSearchFocus() {
  const searchIcon = document.querySelector(".search-input__search-icon");

  if (!isLoading) {
    searchIcon.style.color = "#a855f7";
  }
}

function handleSearchBlur() {
  const searchIcon = document.querySelector(".search-input__search-icon");

  if (!isLoading) {
    searchIcon.style.color = "#9ca3af";
  }
}

function clearSearch() {
  searchInput.value = "";
  clearButton.classList.add("hidden");
  hideAllStates();
  searchInput.focus();
}

function handleTrendingTagClick(e) {
  searchInput.value = e.target.textContent;
  handleSearchInput(e.target.textContent);
}

// Search functionality
async function performSearch(query) {
  if (!query.trim()) {
    hideAllStates();
    return;
  }

  showLoading();

  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const results = filterResults(query);
    displayResults(results, query);
  } catch (error) {
    console.error("Search error:", error);
  } finally {
    hideLoading();
  }
}

function filterResults(query) {
  const searchTerm = query.toLowerCase();

  const filteredTracks = searchData.tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchTerm) ||
      track.artist.toLowerCase().includes(searchTerm) ||
      track.album.toLowerCase().includes(searchTerm)
  );

  const filteredArtists = searchData.artists.filter((artist) =>
    artist.name.toLowerCase().includes(searchTerm)
  );

  const filteredAlbums = searchData.albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchTerm) ||
      album.artist.toLowerCase().includes(searchTerm)
  );

  const filteredPlaylists = searchData.playlists.filter(
    (playlist) =>
      playlist.name.toLowerCase().includes(searchTerm) ||
      playlist.creator.toLowerCase().includes(searchTerm)
  );

  return {
    tracks: filteredTracks,
    artists: filteredArtists,
    albums: filteredAlbums,
    playlists: filteredPlaylists,
  };
}

// Display functions
function displayResults(results, query) {
  const hasResults =
    results.tracks.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0;

  if (!hasResults) {
    showEmptyState(query);
    return;
  }

  hideAllStates();
  searchResults.classList.remove("hidden");

  // Display each section
  displayTracksSection(results.tracks);
  displayArtistsSection(results.artists);
  displayAlbumsSection(results.albums);
  displayPlaylistsSection(results.playlists);
}

function displayTracksSection(tracks) {
  if (tracks.length === 0) {
    tracksSection.classList.add("hidden");
    return;
  }

  tracksSection.classList.remove("hidden");
  tracksList.innerHTML = "";

  const displayTracks = expandedSections.tracks ? tracks : tracks.slice(0, 5);

  displayTracks.forEach((track) => {
    const trackElement = createTrackElement(track);
    tracksList.appendChild(trackElement);
  });

  updateToggleButton("tracks", tracks.length);
}

function displayArtistsSection(artists) {
  if (artists.length === 0) {
    artistsSection.classList.add("hidden");
    return;
  }

  artistsSection.classList.remove("hidden");
  artistsGrid.innerHTML = "";

  const displayArtists = expandedSections.artists
    ? artists
    : artists.slice(0, 5);

  displayArtists.forEach((artist) => {
    const artistElement = createArtistElement(artist);
    artistsGrid.appendChild(artistElement);
  });

  updateToggleButton("artists", artists.length);
}

function displayAlbumsSection(albums) {
  if (albums.length === 0) {
    albumsSection.classList.add("hidden");
    return;
  }

  albumsSection.classList.remove("hidden");
  albumsGrid.innerHTML = "";

  const displayAlbums = expandedSections.albums ? albums : albums.slice(0, 5);

  displayAlbums.forEach((album) => {
    const albumElement = createAlbumElement(album);
    albumsGrid.appendChild(albumElement);
  });

  updateToggleButton("albums", albums.length);
}

function displayPlaylistsSection(playlists) {
  if (playlists.length === 0) {
    playlistsSection.classList.add("hidden");
    return;
  }

  playlistsSection.classList.remove("hidden");
  playlistsGrid.innerHTML = "";

  const displayPlaylists = expandedSections.playlists
    ? playlists
    : playlists.slice(0, 5);

  displayPlaylists.forEach((playlist) => {
    const playlistElement = createPlaylistElement(playlist);
    playlistsGrid.appendChild(playlistElement);
  });

  updateToggleButton("playlists", playlists.length);
}

// Element creation functions
function createTrackElement(track) {
  const trackDiv = document.createElement("div");
  trackDiv.className = "track-item";
  trackDiv.innerHTML = `
    <div class="track-item__image-container">
      <img src="${track.image}" alt="${track.title}" class="track-item__image">
      <div class="track-item__play-overlay">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </div>
    </div>
    <div class="track-item__content">
      <div class="track-item__title">${track.title}</div>
      <div class="track-item__subtitle">${track.artist} • ${track.album}</div>
    </div>
  `;
  return trackDiv;
}

function createArtistElement(artist) {
  const artistDiv = document.createElement("div");
  artistDiv.className = "grid-item";
  artistDiv.innerHTML = `
    <img src="${artist.image}" alt="${artist.name}" class="grid-item__image grid-item__image--round">
    <div class="grid-item__title">${artist.name}</div>
    <div class="grid-item__subtitle">Artist</div>
  `;
  return artistDiv;
}

function createAlbumElement(album) {
  const albumDiv = document.createElement("div");
  albumDiv.className = "grid-item";
  albumDiv.innerHTML = `
    <img src="${album.image}" alt="${album.title}" class="grid-item__image">
    <div class="grid-item__title">${album.title}</div>
    <div class="grid-item__subtitle">${album.artist} • ${album.year}</div>
    <div class="grid-item__meta">${album.trackCount} tracks</div>
  `;
  return albumDiv;
}

function createPlaylistElement(playlist) {
  const playlistDiv = document.createElement("div");
  playlistDiv.className = "grid-item";
  playlistDiv.innerHTML = `
    <div class="grid-item__image-container">
      <img src="${playlist.image}" alt="${playlist.name}" class="grid-item__image">
      <div class="playlist-icon">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </div>
    </div>
    <div class="grid-item__title">${playlist.name}</div>
    <div class="grid-item__subtitle">By ${playlist.creator}</div>
    <div class="grid-item__meta">${playlist.trackCount} tracks</div>
  `;
  return playlistDiv;
}

// Toggle functionality
function updateToggleButton(section, totalCount) {
  const toggleButton = document.getElementById(`${section}Toggle`);
  const toggleText = toggleButton.querySelector(".result-section__toggle-text");

  if (totalCount > 5) {
    toggleButton.classList.remove("hidden");

    if (expandedSections[section]) {
      toggleText.textContent = "Show less";
      toggleButton.classList.add("result-section__toggle--expanded");
    } else {
      toggleText.textContent = `Show all ${totalCount}`;
      toggleButton.classList.remove("result-section__toggle--expanded");
    }
  } else {
    toggleButton.classList.add("hidden");
  }
}

function toggleSection(section) {
  expandedSections[section] = !expandedSections[section];

  // Re-perform the last search to update the display
  const currentQuery = searchInput.value;
  if (currentQuery) {
    const results = filterResults(currentQuery);
    displayResults(results, currentQuery);
  }
}

// State management functions
function showLoading() {
  isLoading = true;
  hideAllStates();
  searchSkeleton.classList.remove("hidden");

  // Update search icon
  const searchIcon = document.querySelector(".search-input__search-icon");
  const loadingIcon = document.querySelector(".search-input__loading-icon");
  searchIcon.classList.add("hidden");
  loadingIcon.classList.remove("hidden");
}

function hideLoading() {
  isLoading = false;
  searchSkeleton.classList.add("hidden");

  // Update search icon
  const searchIcon = document.querySelector(".search-input__search-icon");
  const loadingIcon = document.querySelector(".search-input__loading-icon");
  searchIcon.classList.remove("hidden");
  loadingIcon.classList.add("hidden");
}

function showEmptyState(query) {
  hideAllStates();
  emptyState.classList.remove("hidden");
  emptyStateQuery.textContent = query;
}

function hideAllStates() {
  searchResults.classList.add("hidden");
  emptyState.classList.add("hidden");
  searchSkeleton.classList.add("hidden");
}

// Skeleton creation
function createSkeletonItems() {
  const skeletonItems = document.querySelector(".skeleton-items");
  skeletonItems.innerHTML = "";

  for (let i = 0; i < 5; i++) {
    const skeletonItem = document.createElement("div");
    skeletonItem.className = "skeleton-item";
    skeletonItem.innerHTML = `
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line skeleton-line--subtitle"></div>
      </div>
    `;
    skeletonItems.appendChild(skeletonItem);
  }
}

// Event listener setup
function initializeEventListeners() {
  // Search input events
  searchInput.addEventListener("input", (e) =>
    handleSearchInput(e.target.value)
  );
  searchInput.addEventListener("focus", handleSearchFocus);
  searchInput.addEventListener("blur", handleSearchBlur);

  // Clear button
  clearButton.addEventListener("click", clearSearch);

  // Toggle buttons
  tracksToggle.addEventListener("click", () => toggleSection("tracks"));
  artistsToggle.addEventListener("click", () => toggleSection("artists"));
  albumsToggle.addEventListener("click", () => toggleSection("albums"));
  playlistsToggle.addEventListener("click", () => toggleSection("playlists"));

  // Trending tags
  document.querySelectorAll(".trending-tag").forEach((tag) => {
    tag.addEventListener("click", handleTrendingTagClick);
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeElements();
  initializeEventListeners();
  createSkeletonItems();
});
